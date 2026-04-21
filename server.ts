import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import os from "os";

const execAsync = util.promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for file transfers
  app.use(express.json({ limit: '50mb' }));

  // Build APK Endpoint
  app.post("/api/build-apk", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files) {
        return res.status(400).json({ error: "No files provided" });
      }

      console.log("Starting APK build pipeline...");
      
      // Create a unique temporary directory
      const buildId = Math.random().toString(36).substring(7);
      const buildDir = path.join(os.tmpdir(), `apk_build_${buildId}`);
      await fs.mkdir(buildDir, { recursive: true });

      // 1. Write files to the temporary directory
      for (const [filePath, fileObj] of Object.entries(files) as any) {
        const fullPath = path.join(buildDir, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, typeof fileObj === 'object' && fileObj !== null && 'code' in fileObj ? fileObj.code : fileObj);
      }

      // Ensure package.json exists with Capacitor dependencies
      let pkgJson: any = { name: "generated-app", version: "1.0.0", dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0" }, scripts: { "build": "vite build" } };
      try {
        const existingPkg = await fs.readFile(path.join(buildDir, "package.json"), "utf8");
        pkgJson = JSON.parse(existingPkg);
      } catch (e) {}

      // Inject Capacitor
      pkgJson.dependencies = {
        ...pkgJson.dependencies,
        "@capacitor/core": "latest",
        "@capacitor/android": "latest"
      };
      pkgJson.devDependencies = {
        ...(pkgJson.devDependencies || {}),
        "@capacitor/cli": "latest"
      };
      await fs.writeFile(path.join(buildDir, "package.json"), JSON.stringify(pkgJson, null, 2));

      // Create capacitor.config.json
      const capConfig = {
        appId: "com.nexus.generated",
        appName: "NexusGeneratedApp",
        webDir: "dist",
        bundledWebRuntime: false
      };
      await fs.writeFile(path.join(buildDir, "capacitor.config.json"), JSON.stringify(capConfig, null, 2));

      // Create a simple Vite config if missing
      try {
        await fs.access(path.join(buildDir, "vite.config.ts"));
      } catch {
        try {
          await fs.access(path.join(buildDir, "vite.config.js"));
        } catch {
          await fs.writeFile(path.join(buildDir, "vite.config.js"), `
            import { defineConfig } from 'vite';
            import react from '@vitejs/plugin-react';
            export default defineConfig({ plugins: [react()] });
          `);
        }
      }

      // Execute build pipeline (with generous timeouts)
      console.log("Installing dependencies...");
      await execAsync("npm install", { cwd: buildDir, timeout: 120000 });

      console.log("Building web assets...");
      await execAsync("npm run build", { cwd: buildDir, timeout: 60000 });

      console.log("Adding Capacitor Android platform...");
      await execAsync("npx cap add android", { cwd: buildDir, timeout: 60000 });

      console.log("Syncing Capacitor...");
      await execAsync("npx cap sync android", { cwd: buildDir, timeout: 60000 });

      // Attempt to build the APK using Gradle
      console.log("Compiling APK using Gradle...");
      try {
        await execAsync("./gradlew assembleDebug", { cwd: path.join(buildDir, "android"), timeout: 180000 });
        
        // If successful, send the APK!
        const apkPath = path.join(buildDir, "android/app/build/outputs/apk/debug/app-debug.apk");
        res.download(apkPath, "NexusApp.apk");
      } catch (error) {
        console.error("Gradle build failed. (Expected if Android SDK isn't installed in the container environment). Packaging source zip instead.", error);
        
        // Fallback: If gradle fails (no Android SDK), ZIP the entire build directory with Capacitor fully configured
        // so the user just unzips and runs gradle themselves or opens in Android Studio.
        const zipPath = path.join(os.tmpdir(), `fallback_source_${buildId}.zip`);
        
        // Use Node's built-in tools or a shell command to zip it up
        await execAsync(`zip -r ${zipPath} .`, { cwd: buildDir });
        
        res.setHeader('X-Fallback-Source', 'true');
        res.download(zipPath, "NexusApp-CapacitorSource.zip");
      }

    } catch (error: any) {
      console.error("Error in APK build pipeline:", error);
      res.status(500).json({ error: error.message || "Failed to build APK" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

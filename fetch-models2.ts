import https from "https";
https.get("https://openrouter.ai/api/v1/models", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    const models = JSON.parse(data).data;
    // log some google/meta/openai models
    const target = models.filter((m: any) => m.id.includes("gemini") || m.id.includes("claude-3-7") || m.id.includes("claude-3.7") || m.id.includes("gemini-3") || m.id.includes("gpt-4.5") || m.id.includes("qwen") || m.id.includes("mistral"));
    console.log(target.map((m: any) => `${m.id} (${m.pricing.prompt})`).join("\n"));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

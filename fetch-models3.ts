import https from "https";
https.get("https://openrouter.ai/api/v1/models", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    const models = JSON.parse(data).data;
    const target = models.filter((m: any) => m.id.includes("gpt") || m.id.includes("claude") || m.id.includes("llama-3"));
    console.log(target.map((m: any) => `${m.id}`).join("\n"));
  });
});

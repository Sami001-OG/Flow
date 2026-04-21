import https from "https";
https.get("https://openrouter.ai/api/v1/models", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    const models = JSON.parse(data).data;
    const free = models.filter((m: any) => m.pricing && m.pricing.prompt === "0");
    console.log(free.map((m: any) => `${m.id} - ${m.name}`).join("\n"));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

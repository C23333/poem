const env = process.env;
const siteUrl = env.PUBLIC_SITE_URL || "https://example.com";
const errors = [];

if (siteUrl === "https://example.com") {
  errors.push("PUBLIC_SITE_URL must be a real production domain.");
}

if (env.PUBLIC_ENABLE_ADS === "true" && !env.PUBLIC_ADSENSE_CLIENT) {
  errors.push("PUBLIC_ENABLE_ADS=true requires PUBLIC_ADSENSE_CLIENT.");
}

if (env.PUBLIC_ENABLE_SUBSCRIPTION === "true" && !env.PUBLIC_SUBSCRIPTION_ENDPOINT) {
  errors.push("PUBLIC_ENABLE_SUBSCRIPTION=true requires PUBLIC_SUBSCRIPTION_ENDPOINT.");
}

if (env.PUBLIC_ENABLE_AI === "true" && !env.PUBLIC_AI_ENDPOINT) {
  errors.push("PUBLIC_ENABLE_AI=true requires PUBLIC_AI_ENDPOINT.");
}

const requiredBindings = [
  "POETRY_DB",
  "POETRY_SESSION",
  "POETRY_TOKENS",
  "POETRY_RATE_LIMIT",
  "POETRY_INDEXNOW"
];

for (const binding of requiredBindings) {
  if (env[`REQUIRE_${binding}`] === "true" && !env[binding]) {
    errors.push(`${binding} binding is required but not present in environment.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Production validation passed.");

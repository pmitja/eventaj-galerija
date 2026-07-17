// Secrets are intentionally absent from wrangler.jsonc and therefore from
// generated binding types. They are provisioned with `wrangler secret put`.
interface CloudflareEnv {
  AUTH_SECRET: string;
  ADMIN_PASSWORD_HASH: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}

interface CloudflareEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  IMAGES: ImagesBinding;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  AUTH_SECRET: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  RETENTION_DAYS: string;
  PUBLIC_APP_URL: string;
}

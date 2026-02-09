// src/routes/+page.server.js
import { env } from '$env/dynamic/private';

export async function load() {
  const appName = env.APP_NAME;

  return {
    appName: appName // Mengirim data ke komponen Svelte
  };
}
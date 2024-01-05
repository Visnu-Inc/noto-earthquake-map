export const CLOUDFLARE = {
  ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
  ACCESS_KEY_ID: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? '',
  SECRET_ACCESS_KEY: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? '',
  R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET ?? ''
} as const

export const GOOLGE_MAP = {
  API_KEY: process.env.GOOGLE_MAPS_API_KEY ?? ''
}

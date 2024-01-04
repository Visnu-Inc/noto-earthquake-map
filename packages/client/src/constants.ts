export const googleMap = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? ''
} as const

export const jsonFilePath = {
  info: 'https://noto-earthquake-info-data.visnu.io/info.json',
  road: 'https://noto-earthquake-info-data.visnu.io/road.json',
  support: 'https://noto-earthquake-info-data.visnu.io/support.json',
  store: 'https://noto-earthquake-info-data.visnu.io/store.json '
} as const

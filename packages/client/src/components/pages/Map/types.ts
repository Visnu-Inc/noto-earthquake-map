export type DataSources =
  | "能登地震孤立地域情報まとめ"
  | "各機関活動状況"
  | "応急給水拠点"
  | "Google";

export type StatusMap = Record<DataSources, StatusData>;

export type StatusData = {
  [key in string]: {
    label: string
    layer: google.maps.KmlLayer | null
    checked: boolean
  }
}

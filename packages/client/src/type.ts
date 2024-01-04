export type IsolationAreaInfo = {
  id: string;
  市町村: string;
  市町村2: string;
  市町村3: string;
  状況: string;
  最終更新時刻: string;
  状態: string;
  対応状況: string;
  情報源: string;
  others: string;
};

export type ExtendedIsolationAreaInfo = IsolationAreaInfo & {
  coordinate: google.maps.LatLngLiteral;
};

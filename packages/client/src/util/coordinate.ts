import { LRUCache } from "lru-cache";

let geocoder: google.maps.Geocoder;

const cache = new LRUCache<string, google.maps.LatLngLiteral>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24時間
});

export const getCoordinate = async ({
  県 = "石川県",
  市町村,
  市町村2,
  市町村3,
}: {
  県?: string;
  市町村: string;
  市町村2?: string;
  市町村3?: string;
}): Promise<google.maps.LatLngLiteral> => {
  if (!geocoder) {
    if (!google.maps.Geocoder) {
      console.log("google.maps.Geocoder is not defined");
      return null;
    }
    geocoder = new google.maps.Geocoder();
  }
  const address = `${県}${市町村}${市町村2}${市町村3}`;
  const cached = cache.get(address);
  if (cached) {
    return cached;
  }
  const result = await geocoder.geocode({ address });
  const coordinate = result.results[0].geometry.location.toJSON();
  cache.set(address, coordinate);
  return coordinate;
};

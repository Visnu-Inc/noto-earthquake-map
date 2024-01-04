import type { InfoJsonType } from '../types';
import { jsonFilePath } from '../constants'
import { getCoordinate } from '../util/coordinate'

export type InitMapOptions = {
  onClick?: () => void;
  onDragEnd?: (center?: google.maps.LatLngLiteral) => void;
  onClickData: (event: any) => void;
}

export async function initMap(ref: HTMLDivElement, mapOptions?: google.maps.MapOptions, options?: InitMapOptions) {
  const map = new window.google.maps.Map(ref, mapOptions);

  if (options?.onClick) {
    map.addListener("click", () => {
      options.onClick()
    })
  }

  if (options.onDragEnd) {
    map.addListener("dragend", () => {
      const center = map.getCenter()?.toJSON();
      options.onDragEnd(center)
    })
  }

  const res = await fetch(jsonFilePath.info)
  const body = await res.json() as { data: InfoJsonType[] }
  const data = await Promise.all(
    body.data.map(async (d) => {
      const coordinate = await getCoordinate({
        市町村: d.市町村,
        市町村2: d.市町村2,
        市町村3: d.市町村3,
      })

      return {
        ...d,
        coordinate,
      }
    })
  )

  for (const d of data) {
    map.data.add({
      geometry: new google.maps.Data.Point(d.coordinate),
      properties: d
    })
  }

  map.data.addListener('click', (event) => {
    options.onClickData(event)
 })

  return {
    map,
    data
  }
}

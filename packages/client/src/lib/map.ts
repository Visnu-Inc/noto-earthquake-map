import type { InfoJsonType } from '../types';
import { jsonFilePath } from '../constants'
import { getCoordinate } from '../util/coordinate'

export type InitMapOptions = {
  onClick?: () => void;
  onDragEnd?: (center?: google.maps.LatLngLiteral) => void;
  onClickData: (event: any) => void;
}

async function convertProperty(item: InfoJsonType): Promise<InfoJsonType & google.maps.Data.StyleOptions & { coordinate: google.maps.LatLngLiteral }> {
  const coordinate = await getCoordinate({
    市町村: item.市町村,
    市町村2: item.市町村2,
    市町村3: item.市町村3,
  })

  return {
    ...item,
    coordinate,
    visible: true
  }
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
    body.data.map((item) => convertProperty(item))
  )

  for (const d of data) {
    map.data.add({
      geometry: new google.maps.Data.Point(d.coordinate),
      properties: d,
    })
  }

  map.data.setStyle((feature) => {
    const visible = feature.getProperty('visible') as boolean

    return /** @type {!google.maps.Data.StyleOptions} */({
      visible
    })
  })

  map.data.addListener('click', (event) => {
    options.onClickData(event)
 })

  return {
    map,
    data
  }
}

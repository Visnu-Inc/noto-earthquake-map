import type { InfoJsonType } from '../types';
import { jsonFilePath } from '../constants'
import { getCoordinate } from '../util/coordinate'

async function convertProperty(item: InfoJsonType): Promise<InfoJsonType & google.maps.Data.StyleOptions & { coordinate: google.maps.LatLngLiteral }> {
  let coordinate = item.location
  if (!item.location) {
    coordinate = await getCoordinate({
      市町村: item.市町村,
      市町村2: item.市町村2,
      市町村3: item.市町村3,
    })
    item.location = coordinate
  }

  return {
    ...item,
    coordinate,
    visible: true
  }
}

const kml = {
  '令和6年能登半島地震 各機関活動状況': 'https://www.google.com/maps/d/u/0/kml?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30',
  'R6能登半島地震応急給水拠点': 'https://www.google.com/maps/d/u/0/kml?mid=1daKlXPEULq91w-PUMHZ9KSfwZTMRQxU'
} as const

type Metadatas = Record<keyof typeof kml, google.maps.KmlLayerMetadata>

export type InitMapOptions = {
  onClick?: () => void;
  onDragEnd?: (center?: google.maps.LatLngLiteral) => void;
  onClickData: (event: any) => void;
  onTilesLoaded?: (metadatas: Metadatas) => void;
}

export async function initMap(ref: HTMLDivElement, mapOptions?: google.maps.MapOptions, options?: InitMapOptions) {
  const map = new window.google.maps.Map(ref, mapOptions);

  const layers = {} as Record<keyof typeof kml, google.maps.KmlLayer>
  for (const [key, url] of Object.entries(kml)) {
    const layer = new google.maps.KmlLayer({
      url: url,
      preserveViewport: true,
      map
    })
    layers[key] = layer
  }

  map.addListener('tilesloaded', (e) => {
    const metadatas = {} as Metadatas
    for (const [key, layer] of Object.entries(layers)) {
      metadatas[key] = layer.getMetadata()
    }
    if (options.onTilesLoaded) {
      options.onTilesLoaded(metadatas)
    }
  })

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

  map.data.setStyle((feature) => {
    const visible = feature.getProperty('visible') as boolean

    return /** @type {!google.maps.Data.StyleOptions} */({
      visible
    })
  })

  map.data.addListener('click', (event) => {
    options.onClickData(event)
  })

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

  return {
    map,
    data,
    layers
  }
}

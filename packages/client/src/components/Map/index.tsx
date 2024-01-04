import type { InfoJsonType } from "../../types";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { LinearProgress } from "@mui/material";
import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { googleMap } from '../../constants'
import { initMap, type InitMapOptions } from '../../lib/map'
import { Info, type InfoProps } from './Info'

export const DashboardMap = () => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Wrapper
        apiKey={googleMap.apiKey}
        render={(status) => {
          if (status === Status.LOADING) {
            return <LinearProgress />;
          }
          return <MapContent />;
        }}
      ></Wrapper>
    </div>
  );
};

const MapContent = () => {
  const mapRef = useRef<google.maps.Map>(null)
  const [info, setInfo] = useState<Pick<InfoProps, 'info' | 'show'>>({ info: null, show: false })

  const handleClickData = (e) => {
    const getProp = (key: keyof InfoJsonType) => e.feature.getProperty(key)
    setInfo({
      info: {
        id: getProp('id'),
        市町村: getProp('市町村'),
        市町村2: getProp('市町村2'),
        市町村3: getProp('市町村3'),
        状況: getProp('状況'),
        最終更新時刻: getProp('最終更新時刻'),
        状態: getProp('状態'),
        対応状況: getProp('対応状況'),
        情報源: getProp('情報源'),
        others: getProp('others')
      },
      show: true
    })
  }

  return (
    <>
      <MapContainer
        mapOptions={{
          zoom: 10,
          center: { lat: 37.148329127262755, lng: 136.91671174471176 },
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        }}
        mapRef={mapRef}
        onDataClick={(e) => {
          handleClickData(e)
        }}
      >
      </MapContainer>
      <Info {...info} onClose={() => setInfo({ info: null, show: false })} />
    </>
  )
}

const MapContainer = React.memo(({
  children,
  mapRef,
  onDataClick,
  mapOptions,
}: {
  children?: ReactNode;
  mapRef: React.MutableRefObject<google.maps.Map | null>
  onDataClick: InitMapOptions['onClickData']
  mapOptions: google.maps.MapOptions
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMap(ref.current, mapOptions, {
      onClickData: (e) => {
        onDataClick(e)
      }
    }).then(({ map }) => {
      mapRef.current = map
    })
  }, [])

  return (
    <div style={{ flexGrow: "1", height: "100%" }} ref={ref} id="map">
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { map: mapRef.current } as any);
        }
      })}
    </div>
  )
})

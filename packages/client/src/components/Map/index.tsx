import type { InfoJsonType } from "../../types";
import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import {
  LinearProgress,
  AppBar,
  Container,
  Toolbar,
  Typography
} from "@mui/material";
import { googleMap } from '../../constants'
import { initMap, type InitMapOptions } from '../../lib/map'
import { Info, type InfoProps } from './Info'
import { StatusController } from './StatusController'

function getInfoProp<T extends keyof InfoJsonType>(feature: google.maps.Data.Feature, key: T) {
  return feature.getProperty(key) as InfoJsonType[T]
}

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
  const [statusList, setStatusList] = useState<string[]>([])

  const handleClickData = (e) => {
    setInfo({
      info: {
        id: getInfoProp(e.feature, 'id'),
        市町村: getInfoProp(e.feature, '市町村'),
        市町村2: getInfoProp(e.feature, '市町村2'),
        市町村3: getInfoProp(e.feature, '市町村3'),
        状況: getInfoProp(e.feature, '状況'),
        最終更新時刻: getInfoProp(e.feature, '最終更新時刻'),
        状態: getInfoProp(e.feature, '状態'),
        対応状況: getInfoProp(e.feature, '対応状況'),
        情報源: getInfoProp(e.feature, '情報源'),
        location: getInfoProp(e.feature, 'location'),
        others: getInfoProp(e.feature, 'others')
      },
      show: true
    })
  }

  return (
    <div style={{ height: '100%' }}>
      <AppBar>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex' }} disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              能登地震孤立地域情報まとめ
            </Typography>
            <Typography
              variant="caption"
              component="a"
              href="https://docs.google.com/spreadsheets/d/1Wa3EltKUwq2-d8W8s6QlJ7TIEC83kc8131xuX9q_5OI/edit?pli=1#gid=0"
              target="_blank"
            >
              更新元スプレッドシート
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <MapContainer
        mapOptions={{
          zoom: 10,
          center: { lat: 37.148329127262755, lng: 136.91671174471176 },
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        }}
        onDataClick={(e) => {
          handleClickData(e)
        }}
        onInitMap={({ map, data }) => {
          mapRef.current = map
          const statusSet = new Set<string>()
          for (const item of data) {
            item.状態 && statusSet.add(item.状態)
          }
          setStatusList(Array.from(statusSet))
        }}
      >
      </MapContainer>
      <StatusController
        statusList={statusList}
        onChange={(status) => {
          mapRef.current.data.forEach((feature) => {
            const s = getInfoProp(feature, '状態')
            feature.setProperty('visible', status[s] === true)
          })
        }}
      />
      <Info {...info} onClose={() => setInfo({ info: null, show: false })} />
    </div>
  )
}

type MapContainerProps = {
  children?: ReactNode;
  onDataClick: InitMapOptions['onClickData']
  mapOptions: google.maps.MapOptions
  onInitMap: (arg: Awaited<ReturnType<typeof initMap>>) => void
}

const MapContainer = React.memo(({
  children,
  onDataClick,
  mapOptions,
  onInitMap
}: MapContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initMap(ref.current, mapOptions, {
      onClickData: (e) => {
        onDataClick(e)
      }
    }).then(({ map, data }) => {
      onInitMap({ map, data })
    })
  }, [])

  return (
    <div style={{ flexGrow: "1", height: "100%" }} ref={ref} id="map">
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { map: ref.current } as any);
        }
      })}
    </div>
  )
})

import { Status, Wrapper } from "@googlemaps/react-wrapper";
import {
  AppBar,
  Container,
  LinearProgress,
  Toolbar,
  Typography
} from "@mui/material";
import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { googleMap } from '../../constants';
import { initMap, type InitMapOptions } from '../../lib/map';
import type { InfoJsonType } from "../../types";
import { Footer } from './Footer';
import { Info, type InfoProps } from './Info';
import { StatusController } from './StatusController';

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
  const [showKikanActivity, setShowKikanActivity] = useState<boolean>(true);
  const kikanActivityStatus = "各機関活動状況";

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              更新元データ
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ flexGrow: 1 }}>
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
            statusSet.add(kikanActivityStatus);
            setStatusList(Array.from(statusSet));
          }}
        >
          <KikanActivityKmlLayer
            map={mapRef.current}
            visible={showKikanActivity}
          />
        </MapContainer>
        <StatusController
          statusList={statusList}
          onChange={(status) => {
            mapRef.current?.data.forEach((feature) => {
              const s = getInfoProp(feature, '状態')
              feature.setProperty('visible', status[s] === true)
            })
            setShowKikanActivity(status[kikanActivityStatus] === true);
          }}
        />
        <Info {...info} onClose={() => setInfo({ info: null, show: false })} />
      </div>
      <Footer />
    </div>
  );
};

// 各機関活動状況のKMLレイヤー
const KikanActivityKmlLayer = ({
  map,
  visible,
}: {
  map: google.maps.Map;
  visible: boolean;
}) => {
  const [kmlLayer, setKmlLayer] = useState<google.maps.KmlLayer | null>(null);

  useEffect(() => {
    if (!visible || kmlLayer || !map) return;
    const layer = new google.maps.KmlLayer({
      //　MyMapsのKMLファイル内から抜き出している
      url: "https://www.google.com/maps/d/u/0/kml?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30",
      preserveViewport: true,
      map,
    });
    console.log("layer", layer)
    setKmlLayer(layer);
    return () => {
      if (!kmlLayer) return;
      kmlLayer.setMap(null);
    };
  }, [kmlLayer, map, visible]);

  // toggle visible layer
  useEffect(() => {
    if (!kmlLayer) return;
    kmlLayer.setMap(visible ? map : null);
  }, [kmlLayer, map, visible]);

  return null;
};

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
            return cloneElement(child);
          }
        })}
      </div>
    );
  }
);

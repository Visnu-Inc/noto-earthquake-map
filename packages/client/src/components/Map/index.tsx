import { Status as GoogleMapsStatus, Wrapper } from "@googlemaps/react-wrapper";
import {
  AppBar,
  Container,
  LinearProgress,
  Link,
  Stack,
  Toolbar,
  Typography,
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
import { StatusController, type Status } from "./StatusController";

function getInfoProp<T extends keyof InfoJsonType>(feature: google.maps.Data.Feature, key: T) {
  return feature.getProperty(key) as InfoJsonType[T]
}

export const DashboardMap = () => {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Wrapper
        apiKey={googleMap.apiKey}
        render={(status) => {
          if (status === GoogleMapsStatus.LOADING) {
            return <LinearProgress />;
          }
          return <MapContent />;
        }}
      ></Wrapper>
    </div>
  );
};

export type DataSources =
  | "能登地震孤立地域情報まとめ"
  | "令和6年能登半島地震 各機関活動状況"
  | "Google";

export type StatusList = Record<DataSources, string[]>;

const MapContent = () => {
  const mapRef = useRef<google.maps.Map>(null)
  const [info, setInfo] = useState<Pick<InfoProps, 'info' | 'show'>>({ info: null, show: false })
  const [statusList, setStatusList] = useState<StatusList | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

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
        直近支援ニーズ: getInfoProp(e.feature, '直近支援ニーズ'),
        情報源: getInfoProp(e.feature, '情報源'),
        location: getInfoProp(e.feature, 'location'),
        others: getInfoProp(e.feature, 'others')
      },
      show: true
    });
  };

  useEffect(() => {
    if (!status) return;
    mapRef.current?.data.forEach((feature) => {
      const s = getInfoProp(feature, "状態");
      feature.setProperty(
        "visible",
        status.能登地震孤立地域情報まとめ[s] === true
      );
    });
  }, [status]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <AppBar>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex" }} disableGutters>
            <Typography component="div" sx={{ flexGrow: 1, wordBreak:"auto-phrase", fontSize:16 }}>
              令和6年能登半島地震 <wbr/>孤立地域及び支援情報まとめ
            </Typography>
            <Stack>
              <Typography fontSize={10}>更新元データ</Typography>
              <Link
                color="inherit"
                fontSize={11}
                href="https://docs.google.com/spreadsheets/d/1Wa3EltKUwq2-d8W8s6QlJ7TIEC83kc8131xuX9q_5OI/edit?pli=1#gid=0"
                target="_blank"
              >
                能登地震孤立地域情報まとめ
              </Link>
              <Link
                color="inherit"
                fontSize={11}
                href="https://www.google.com/maps/d/u/0/edit?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30&usp=sharing"
                target="_blank"
              >
                令和6年能登半島地震　各機関活動状況
              </Link>
            </Stack>
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
            mapRef.current = map;
            const list: StatusList = {} as StatusList;
            const statusSet = new Set<string>();
            for (const item of data) {
              item.状態 && statusSet.add(item.状態);
            }
            list["能登地震孤立地域情報まとめ"] = Array.from(statusSet);
            list["令和6年能登半島地震 各機関活動状況"] = ["各機関活動状況"];
            list["Google"] = ["交通情報"];
            setStatusList(list);
          }}
        >
          <KikanActivityKmlLayer
            map={mapRef.current}
            visible={
              status?.["令和6年能登半島地震 各機関活動状況"]["各機関活動状況"]
            }
          />
          <TrafficLayer
            map={mapRef.current}
            visible={status?.Google["交通情報"]}
          />
        </MapContainer>
        <StatusController
          statusList={statusList}
          onChange={(status) => {
            setStatus(status);
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

const TrafficLayer = ({
  map,
  visible,
}: {
  map: google.maps.Map;
  visible: boolean;
}) => {
  const [trafficLayer, setTrafficLayer] =
    useState<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || trafficLayer) return;
    const layer = new google.maps.TrafficLayer();
    setTrafficLayer(layer);
    return () => {
      if (!trafficLayer) return;
      trafficLayer.setMap(null);
    };
  }, [map, trafficLayer]);

  // toggle visible layer
  useEffect(() => {
    if (!trafficLayer) return;
    trafficLayer.setMap(visible ? map : null);
  }, [map, trafficLayer, visible]);

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

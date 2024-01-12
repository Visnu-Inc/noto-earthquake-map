import { Status as GoogleMapsStatus, Wrapper } from "@googlemaps/react-wrapper";
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
import type { StatusMap } from './types'
import { googleMap } from "../../../constants";
import { initMap, type InitMapOptions } from "../../../lib/map";
import type { InfoJsonType } from "../../../types";
import { Layout } from "../../Layout";
import { Info, type InfoProps } from "./Info";
import { StatusController, type StateMap } from "./StatusController";
import { KmlLayer, TrafficLayer } from "./layer";

function getInfoProp<T extends keyof InfoJsonType>(
  feature: google.maps.Data.Feature,
  key: T
) {
  return feature.getProperty(key) as InfoJsonType[T];
}

export default function DashboardMap() {
  return (
    <Layout>
      <Wrapper
        apiKey={googleMap.apiKey}
        language="ja"
        region="JP"
        render={(status) => {
          if (status === GoogleMapsStatus.LOADING) {
            return <LinearProgress />;
          }
          return <MapContent />;
        }}
      ></Wrapper>
    </Layout>
  );
}

const MapContent = () => {
  const mapRef = useRef<google.maps.Map>(null);
  const [info, setInfo] = useState<Pick<InfoProps, "info" | "show">>({
    info: null,
    show: false,
  });
  const [statusMap, setStatusMap] = useState<StatusMap | null>(null);

  const handleClickData = (e) => {
    setInfo({
      info: {
        id: getInfoProp(e.feature, "id"),
        市町村: getInfoProp(e.feature, "市町村"),
        市町村2: getInfoProp(e.feature, "市町村2"),
        市町村3: getInfoProp(e.feature, "市町村3"),
        状況: getInfoProp(e.feature, "状況"),
        最終更新時刻: getInfoProp(e.feature, "最終更新時刻"),
        状態: getInfoProp(e.feature, "状態"),
        対応状況: getInfoProp(e.feature, "対応状況"),
        直近支援ニーズ: getInfoProp(e.feature, "直近支援ニーズ"),
        情報源: getInfoProp(e.feature, "情報源"),
        location: getInfoProp(e.feature, "location"),
        others: getInfoProp(e.feature, "others"),
      },
      show: true,
    });
  };

  useEffect(() => {
    if (!statusMap) return;
    mapRef.current?.data.forEach((feature) => {
      const s = getInfoProp(feature, "状態");
      feature.setProperty(
        "visible",
        statusMap.能登地震孤立地域情報まとめ[s]?.checked === true
      );
    });
  }, [statusMap]);

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
        onDataClick={(e) => {
          handleClickData(e);
        }}
        onInitMap={({ map, data, layers }) => {
          mapRef.current = map;
          const statusSet = new Set<string>();
          for (const item of data) {
            item.状態 && statusSet.add(item.状態);
          }

          const 能登地震孤立地域情報まとめ = Array.from(statusSet).reduce((acc, status) => {
            const checked = ["孤立・要支援", "状況不明"].some((e) =>
              status.includes(e)
            )

            return {
              ...acc,
              [status]: {
                label: status,
                layer: null,
                checked: checked
              }
            }
          }, {} as StatusMap["能登地震孤立地域情報まとめ"])

          const sMap: StatusMap = {
            能登地震孤立地域情報まとめ,
            各機関活動状況: {
              各機関活動状況: {
                label: "各機関活動状況",
                layer: layers["令和6年能登半島地震 各機関活動状況"],
                checked: true
              }
            },
            応急給水拠点: {
              応急給水拠点: {
                label: "応急給水拠点",
                layer: layers['R6能登半島地震応急給水拠点'],
                checked: false
              }
            },
            Google: {
              "交通情報": {
                label: "交通情報",
                layer: null,
                checked: false
              }
            }
          };

          setStatusMap(sMap);
        }}
      >
        <KmlLayer
          layer={statusMap ? statusMap["各機関活動状況"]["各機関活動状況"].layer : null}
          map={mapRef.current}
          visible={
            statusMap ? statusMap["各機関活動状況"]["各機関活動状況"].checked : false
          }
        />
        <KmlLayer
          layer={statusMap ? statusMap["応急給水拠点"]["応急給水拠点"].layer : null}
          map={mapRef.current}
          visible={
            statusMap ? statusMap["応急給水拠点"]["応急給水拠点"].checked : false}
        />
        <TrafficLayer
          map={mapRef.current}
          visible={statusMap?.Google["交通情報"].checked}
        />
      </MapContainer>
      <StatusController
        statusList={statusMap}
        onChange={(statusMap) => {
          setStatusMap(statusMap)
        }}
      />
      <Info {...info} onClose={() => setInfo({ info: null, show: false })} />
    </>
  );
};


type MapContainerProps = {
  children?: ReactNode;
  onDataClick: InitMapOptions["onClickData"];
  mapOptions: google.maps.MapOptions;
  onInitMap: (arg: Awaited<ReturnType<typeof initMap>>) => void;
  onTilesLoaded?: InitMapOptions['onTilesLoaded'];
};

const MapContainer = React.memo(
  (props: MapContainerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      initMap(ref.current, props.mapOptions, {
        onClickData: props.onDataClick,
        onTilesLoaded: props.onTilesLoaded
      }).then(props.onInitMap);
    }, []);

    return (
      <div style={{ flexGrow: "1", height: "100%" }} ref={ref} id="map">
        {Children.map(props.children, (child) => {
          if (isValidElement(child)) {
            return cloneElement(child);
          }
        })}
      </div>
    );
  }
);

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
import { googleMap } from "../../../constants";
import { initMap, type InitMapOptions } from "../../../lib/map";
import type { InfoJsonType } from "../../../types";
import { Layout } from "../../Layout";
import { Info, type InfoProps } from "./Info";
import { StatusController, type Status } from "./StatusController";
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

export type DataSources =
  | "能登地震孤立地域情報まとめ"
  | "令和6年能登半島地震 各機関活動状況"
  | "R6能登半島地震応急給水拠点"
  | "Google";

export type StatusList = Record<DataSources, string[]>;

const MapContent = () => {
  const mapRef = useRef<google.maps.Map>(null);
  const [info, setInfo] = useState<Pick<InfoProps, "info" | "show">>({
    info: null,
    show: false,
  });
  const [statusList, setStatusList] = useState<StatusList | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

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
        onInitMap={({ map, data }) => {
          mapRef.current = map;
          const list: StatusList = {} as StatusList;
          const statusSet = new Set<string>();
          for (const item of data) {
            item.状態 && statusSet.add(item.状態);
          }
          list["能登地震孤立地域情報まとめ"] = Array.from(statusSet);
          list["令和6年能登半島地震 各機関活動状況"] = ["各機関活動状況"];
          list["R6能登半島地震応急給水拠点"] = ["応急給水拠点1月7日"];
          list["Google"] = ["交通情報"];
          setStatusList(list);
        }}
      >
        <KmlLayer
          layerUrl="https://www.google.com/maps/d/u/0/kml?mid=1PWNOtM4Zbmz-yr92ftQ6NQvp3K6fh30"
          map={mapRef.current}
          visible={
            status?.["令和6年能登半島地震 各機関活動状況"]["各機関活動状況"]
          }
        />
        <KmlLayer
          layerUrl="https://www.google.com/maps/d/u/0/kml?mid=17UWU-Rmje_Ul31o7w4fQlbgF3NN-954&lid=uss0GxUzELk"
          map={mapRef.current}
          visible={status?.["R6能登半島地震応急給水拠点"]["応急給水拠点1月7日"]}
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
    </>
  );
};

type MapContainerProps = {
  children?: ReactNode;
  onDataClick: InitMapOptions["onClickData"];
  mapOptions: google.maps.MapOptions;
  onInitMap: (arg: Awaited<ReturnType<typeof initMap>>) => void;
};

const MapContainer = React.memo(
  ({ children, onDataClick, mapOptions, onInitMap }: MapContainerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      initMap(ref.current, mapOptions, {
        onClickData: (e) => {
          onDataClick(e);
        },
      }).then(({ map, data }) => {
        onInitMap({ map, data });
      });
    }, []);

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

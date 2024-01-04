import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { LinearProgress, Stack, Typography } from "@mui/material";
import React, {
  Children,
  ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import TestData from "../info.json";
import { ExtendedIsolationAreaInfo, IsolationAreaInfo } from "../type";
import { getCoordinate } from "../util/coordinate";

const MapContainer = ({
  children,
  mapRef,
  onClick,
  onDragEnd,
  mapOptions,
}: {
  children?: ReactNode;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
  onClick?: () => void;
  onDragEnd?: (center?: google.maps.LatLngLiteral) => void;
  mapOptions?: google.maps.MapOptions;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    // map生成
    if (map) return;
    if (!ref.current) return;
    const _map = new window.google.maps.Map(ref.current, mapOptions);
    setMap(_map);
    if (mapRef) mapRef.current = _map;
  }, [map, mapOptions, mapRef]);

  useEffect(() => {
    if (!map) return;
    if (onClick) {
      map.addListener("click", () => {
        onClick();
      });
    }
    if (onDragEnd) {
      map.addListener("dragend", () => {
        const center = map.getCenter()?.toJSON();
        onDragEnd(center);
      });
    }
  }, [map, onClick, onDragEnd]);

  return (
    <div style={{ flexGrow: "1", height: "100%" }} ref={ref} id="map">
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { map } as any);
        }
      })}
    </div>
  );
};

export const DashboardMap = () => {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Wrapper
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
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
  // refs
  const mapRef = useRef<google.maps.Map>(null);

  // states
  const [selectedPlace, setSelectedPlace] = useState<IsolationAreaInfo | null>(
    null
  );
  const [infoData, setInfoData] = useState<ExtendedIsolationAreaInfo[]>();

  const selectedPlaceCoordinate = useMemo(() => {
    if (!selectedPlace) return;
    const place = infoData?.find((d) => d.id === selectedPlace.id);
    return place?.coordinate;
  }, [selectedPlace, infoData]);

  // callbacks
  const handleSelectPlace = useCallback((place: IsolationAreaInfo) => {
    setSelectedPlace(place);
  }, []);
  useEffect(() => {
    (async () => {
      if (!infoData) {
        // const res = await fetch(
        //   "https://noto-earthquake-info-data.visnu.io/info.json"
        // );
        // const data = await res.json();
        const data = TestData;
        const extendData = await Promise.all(
          data.map(async (d: any) => {
            const coordinate = await getCoordinate({
              市町村: d.市町村,
              市町村2: d.市町村2,
              市町村3: d.市町村3,
            });
            return {
              ...d,
              coordinate,
            };
          })
        );
        setInfoData(extendData);
      }
    })();
  }, []);

  return (
    <MapContainer
      mapOptions={{
        zoom: 10,
        center: { lat: 36.594606, lng: 136.625669 },
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      }}
      mapRef={mapRef}
      onClick={() => setSelectedPlace(null)}
    >
      {infoData?.map((data, i) => (
        <Marker
          key={i}
          position={data.coordinate}
          onClick={() => handleSelectPlace(data)}
        />
      ))}
      {selectedPlace ? (
        <InfoWindow map={mapRef.current!} position={selectedPlaceCoordinate}>
          <PlaceInfoWindow info={selectedPlace} />
        </InfoWindow>
      ) : null}
    </MapContainer>
  );
};

const InfoWindow = ({
  map,
  position,
  children,
  onClose,
}: {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral | undefined;
  children: ReactNode;
  onClose?: () => void;
}) => {
  const id = "info-window-content";
  const infoWindow = useMemo(
    () =>
      new google.maps.InfoWindow({
        content: `<div id=${id} />`,
      }),
    []
  );

  useEffect(() => {
    infoWindow.setPosition(position);
  }, [position, infoWindow]);

  useEffect(() => {
    infoWindow.addListener("domready", () => {
      const root = createRoot(document.getElementById(id)!);
      root.render(<>{children}</>);
    });
    infoWindow.open(map);
  }, [children, infoWindow, map]);

  useEffect(() => {
    if (!onClose) return;
    infoWindow.addListener("closeclick", () => {
      onClose();
    });
  }, [infoWindow, onClose]);

  return null;
};

const PlaceInfoWindow = ({ info }: { info: IsolationAreaInfo | null }) => {
  return (
    <Stack gap={1} sx={{ minWidth: 400, width: 400 }}>
      <Stack gap={0}>
        <Typography fontSize={12}>{info?.id}</Typography>
        <Stack gap={0} direction={"row"}>
          <Typography>{info?.市町村}</Typography>
          <Typography>{info?.市町村2}</Typography>
          <Typography>{info?.市町村3}</Typography>
        </Stack>
      </Stack>
      <Stack gap={1}>
        <Typography>状態：{info?.状態}</Typography>
        <Typography>状況：{info?.状況}</Typography>
        <Typography>対応状況：{info?.対応状況}</Typography>
        <Typography>
          <a href={info?.情報源}>情報源</a>
        </Typography>
      </Stack>
    </Stack>
  );
};

const Marker: React.FC<
  google.maps.MarkerOptions & { onClick?: () => void }
> = ({ onClick, ...options }) => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  useEffect(() => {
    if (marker) {
      marker.addListener("click", () => {
        onClick?.();
      });
    }
  }, [marker, onClick]);

  return null;
};

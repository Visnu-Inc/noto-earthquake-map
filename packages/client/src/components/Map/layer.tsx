import { useEffect, useState } from "react";

export const KmlLayer = ({
  layerUrl,
  map,
  visible,
}: {
  layerUrl: string;
  map: google.maps.Map;
  visible: boolean;
}) => {
  const [kmlLayer, setKmlLayer] = useState<google.maps.KmlLayer | null>(null);

  useEffect(() => {
    if (!visible || kmlLayer || !map) return;
    const layer = new google.maps.KmlLayer({
      url: layerUrl,
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

export const TrafficLayer = ({
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

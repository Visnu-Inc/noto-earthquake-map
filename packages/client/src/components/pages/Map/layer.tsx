import { useEffect, useState } from "react";

export const KmlLayer = ({
  layer,
  map,
  visible,
}: {
  layer: google.maps.KmlLayer;
  map: google.maps.Map;
  visible: boolean;
}) => {
  // toggle visible layer
  useEffect(() => {
    if (!layer) return;
    layer.setMap(visible ? map : null);
  }, [layer, map, visible]);

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

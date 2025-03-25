import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { useLocation } from "~/hooks/useLocation";
import { requestLocation } from "~/hooks/requestLocation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Maps() {
  const { data, isError, error, isSuccess } = useLocation();
  const requestLocationMutation = requestLocation();

  const queryClient = useQueryClient();

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    if (isError) {
      if (error.code === "ERR_LOCATION_UNAUTHORIZED") {
        requestLocationMutation.mutate(undefined, {
          onSuccess: () => {
            if (requestLocationMutation.data?.granted) {
              queryClient.invalidateQueries({ queryKey: ["useLocation"] });
            }
          },
        });
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      setLatitude(data.coords.latitude);
      setLongitude(data.coords.longitude);
    }
  }, [isSuccess]);

  return (
    <SafeAreaView className="flex-1">
      <MapView
        style={{ width: "100%", height: "50%" }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: latitude ?? 4.1093195,
          longitude: longitude ?? 109.45547499999998,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: latitude ?? 4.1093195,
            longitude: longitude ?? 109.45547499999998,
          }}
        />
      </MapView>
    </SafeAreaView>
  );
}

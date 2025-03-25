import * as Location from "expo-location";
import { useMutation } from "@tanstack/react-query";

export function requestLocation() {
  return useMutation({
    mutationFn: Location.requestForegroundPermissionsAsync,
    mutationKey: ["requestLocation"],
  });
}

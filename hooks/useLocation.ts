import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";

export function useLocation() {
  return useQuery({
    queryFn: async () => await Location.getCurrentPositionAsync(),
    queryKey: ["useLocation"],
    refetchInterval: 30000,
  });
}
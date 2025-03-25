import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";

export function useLocation() {
  return useQuery({
    queryFn: () => Location.getCurrentPositionAsync(),
    queryKey: ["useLocation"],
  });
}
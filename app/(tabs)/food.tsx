import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useLocation } from "~/hooks/useLocation";
import { requestLocation } from "~/hooks/requestLocation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LocationInput } from "~/components/food/location-input";
import { Map } from "~/components/food/map";
import { SelectRadius } from "~/components/food/select-radius";
import { GetNearbyRestaurantsButton } from "~/components/food/get-nearby-restaurants";
import { RestaurantRecommendations } from "~/components/food/restaurant-recommendations";
import { foodPageStore } from "~/store/foodPageStore";

export default function FoodFinder() {
  const queryClient = useQueryClient();

  const useLocationQuery = useLocation();

  const requestLocationMutation = requestLocation();

  useEffect(() => {
    if (useLocationQuery.isError && requestLocationMutation.isIdle) {
      if (
        "code" in useLocationQuery.error &&
        useLocationQuery.error.code === "ERR_LOCATION_UNAUTHORIZED"
      ) {
        requestLocationMutation.mutate(undefined, {
          onSuccess: (data) => {
            if (data.granted) {
              queryClient.invalidateQueries({ queryKey: ["useLocation"] });
            }
          },
        });
      }
    }
  }, [useLocationQuery.isError]);

  useEffect(() => {
    if (useLocationQuery.isLoading) {
      foodPageStore.trigger.onLocationQueryLoading();
    } else if (useLocationQuery.isSuccess) {
      foodPageStore.trigger.onLocationQuerySuccess({
        latitude: useLocationQuery.data.coords.latitude,
        longitude: useLocationQuery.data.coords.longitude,
      });
    }
  }, [useLocationQuery.data]);

  return (
    <View className="flex-1">
      <KeyboardAvoidingView className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <LocationInput />

          <Map />

          <View className="flex-row justify-between items-center gap-2 py-2 px-4">
            <SelectRadius />
            <GetNearbyRestaurantsButton />
          </View>

          <RestaurantRecommendations />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

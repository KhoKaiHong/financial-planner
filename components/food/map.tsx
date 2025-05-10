import { View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { foodPageStore } from "~/store/foodPageStore";
import { useSelector } from "@xstate/store/react";
import { YourLocationIcon } from "./your-location-icon";

export function Map() {
  const originCoords = useSelector(
    foodPageStore,
    (state) => state.context.originCoords
  );

  const mapCoords = useSelector(
    foodPageStore,
    (state) => state.context.mapCoords
  );

  const originLocationResolvedText = useSelector(
    foodPageStore,
    (state) => state.context.originLocationResolvedText
  );

  const restaurants = useSelector(
    foodPageStore,
    (state) => state.context.restaurants
  );

  const region = {
    ...mapCoords,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View className="h-60 flex rounded-3xl overflow-hidden border-primary border-2 mx-4">
      <MapView
        style={{ flex: 1, width: "100%", height: "100%" }}
        minZoomLevel={13}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        region={region}
      >
        {originCoords !== null && (
          <Marker coordinate={originCoords} title={originLocationResolvedText}>
            <YourLocationIcon />
          </Marker>
        )}
        {restaurants !== null &&
          restaurants.map((restaurant, index) => (
            <Marker
              key={index}
              coordinate={restaurant.coordinates}
              title={restaurant.name}
            />
          ))}
      </MapView>
    </View>
  );
}

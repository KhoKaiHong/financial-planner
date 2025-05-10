import { createStore } from "@xstate/store";
import { autocompleteResult } from "~/components/food/location-input";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Restaurant = {
  name: string;
  type: string;
  coordinates: Coordinates;
  rating: number;
  mapsUrl: string;
  openNow?: boolean;
  openingHours?: string[];
  priceStart?: string;
  priceEnd?: string;
  reviewSummary: string;
  foodRecommendation: string;
};

type MapPageStoreContextType = {
  locationPermission: string;
  mapCoords: Coordinates;
  originCoords: Coordinates | null;
  autoCompleteSuggestions: { placeId: string; text: string }[];
  overlayOpen: boolean;
  originLocationInputText: string;
  originLocationResolvedText: string;
  searchRadius: number;
  restaurants: Restaurant[] | null;
  fetchingNearbyRestaurants: boolean;
};

const foodPageStoreContext: MapPageStoreContextType = {
  locationPermission: "denied",
  mapCoords: { latitude: 3.1319, longitude: 101.6841 },
  originCoords: null,
  autoCompleteSuggestions: [],
  overlayOpen: false,
  originLocationInputText: "",
  originLocationResolvedText: "",
  searchRadius: 1,
  restaurants: null,
  fetchingNearbyRestaurants: false,
};

export const foodPageStore = createStore({
  context: foodPageStoreContext,
  on: {
    onLocationQueryLoading: (context) => ({
      ...context,
      locationPermission: "fetching",
      originCoords: null,
      originLocationInputText: "",
      originLocationResolvedText: "",
    }),
    onLocationQuerySuccess: (
      context,
      event: { latitude: number; longitude: number }
    ) => {
      const userUsingCurrentLocation =
        context.originLocationInputText === "Current Location" &&
        context.originLocationResolvedText === "Current Location";

      const currentLocationIsNotSet =
        context.locationPermission !== "granted" &&
        context.originCoords === null;

      if (userUsingCurrentLocation || currentLocationIsNotSet) {
        return {
          ...context,
          locationPermission: "granted",
          mapCoords: { latitude: event.latitude, longitude: event.longitude },
          originCoords: {
            latitude: event.latitude,
            longitude: event.longitude,
          },
          originLocationInputText: "Current Location",
          originLocationResolvedText: "Current Location",
        };
      }
    },
    onInputChange: (context, event: { text: string }) => {
      const trimmed = event.text.trimStart();
      return {
        ...context,
        originLocationInputText: trimmed,
      };
    },
    onInputFocus: (context) => {
      if (context.originLocationInputText === "Current Location") {
        return {
          ...context,
          originLocationInputText: "",
          overlayOpen: true,
        };
      } else {
        return {
          ...context,
          overlayOpen: true,
        };
      }
    },
    onInputBlur: (context) => ({
      ...context,
      overlayOpen: false,
      originLocationInputText: context.originLocationResolvedText,
    }),
    onAutocompleteMutationSuccess: (
      context,
      event: { result: autocompleteResult | null }
    ) => {
      if (event.result === null) {
        return {
          ...context,
          autoCompleteSuggestions: [],
        };
      } else {
        return {
          ...context,
          autoCompleteSuggestions: event.result.suggestions.map(
            (suggestion) => {
              return {
                placeId: suggestion.placePrediction.placeId,
                text: suggestion.placePrediction.structuredFormat.mainText.text,
              };
            }
          ),
        };
      }
    },
    onSelectOriginLocation: (context, event: { placeName: string }) => ({
      ...context,
      originLocationInputText: event.placeName,
      originLocationResolvedText: event.placeName,
      overlayOpen: false,
    }),
    onGetCoordsByPlaceIdMutationSuccess: (
      context,
      event: { coords: Coordinates }
    ) => ({
      ...context,
      mapCoords: event.coords,
      originCoords: event.coords,
    }),
    onUseCurrentLocation: (
      context,
      event: { latitude: number; longitude: number }
    ) => {
      if (context.originLocationInputText !== "Current Location") {
        return {
          ...context,
          mapCoords: { latitude: event.latitude, longitude: event.longitude },
          originCoords: {
            latitude: event.latitude,
            longitude: event.longitude,
          },
          originLocationInputText: "Current Location",
          originLocationResolvedText: "Current Location",
        };
      }
    },
    onSelectSearchRadius: (context, event: { value: string }) => {
      const searchRadius = Number(event.value);
      return {
        ...context,
        searchRadius: searchRadius,
      };
    },
    onGetNearbyRestaurantsMutationStart: (context) => ({
      ...context,
      fetchingNearbyRestaurants: true,
    }),
    onGetNearbyRestaurantsMutationSuccess: (
      context,
      event: { restaurants: Restaurant[] }
    ) => ({
      ...context,
      restaurants: event.restaurants,
      fetchingNearbyRestaurants: false,
    }),
  },
});

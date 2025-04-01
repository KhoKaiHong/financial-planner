import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { useLocation } from "~/hooks/useLocation";
import { requestLocation } from "~/hooks/requestLocation";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetch } from "expo/fetch";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { TextInput } from "react-native";
import { Input } from "~/components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";
import { YourLocationIcon } from "~/components/maps/your-location-icon";
import { YourLocationIconDisplay } from "~/components/maps/your-location-icon-display";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Locate } from "~/lib/icons/Locate";
import { LocateOff } from "~/lib/icons/LocateOff";
import { createStore } from "@xstate/store";
import { useSelector } from "@xstate/store/react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type autocompleteCurrentLocationBody = {
  input: string;
  includeQueryPredictions: boolean;
  includedRegionCodes: string[];
  languageCode: string;
  locationBias?: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
};

type autocompleteResult = {
  suggestions: {
    placePrediction: {
      placeId: string;
      structuredFormat: {
        mainText: {
          text: string;
        };
      };
    };
  }[];
};

async function autocompleteLocation(body: autocompleteCurrentLocationBody) {
  const resp = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat.mainText.text",
      },
      body: JSON.stringify(body),
      method: "POST",
    }
  );

  const result = await resp.json();

  if (Object.keys(result).length !== 0) {
    return result as autocompleteResult;
  } else {
    return null;
  }
}

async function getCoordsByPlaceId(placeId: string) {
  const resp = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        "X-Goog-FieldMask": "location",
      },
      method: "GET",
    }
  );

  const result = await resp.json();

  return result.location as Coordinates;
}

type MapPageStoreContextType = {
  locationPermission: string;
  mapCoords: Coordinates;
  originCoords: Coordinates | null;
  autoCompleteSuggestions: { placeId: string; text: string }[];
  originLocationBody: autocompleteCurrentLocationBody;
  overlayOpen: boolean;
  originLocationInputText: string;
  originLocationResolvedText: string;
};

const mapPageStoreContext: MapPageStoreContextType = {
  locationPermission: "denied",
  mapCoords: { latitude: 3.1319, longitude: 101.6841 },
  originCoords: null,
  autoCompleteSuggestions: [],
  originLocationBody: {
    input: "",
    includeQueryPredictions: false,
    includedRegionCodes: ["my"],
    languageCode: "en",
  },
  overlayOpen: false,
  originLocationInputText: "",
  originLocationResolvedText: "",
};

const mapPageStore = createStore({
  context: mapPageStoreContext,
  on: {
    locationQueryFetching: (context) => ({
      ...context,
      locationPermission: "fetching",
      originCoords: null,
      originLocationInputText: "",
      originLocationResolvedText: "",
      originLocationBody: {
        input: "",
        includeQueryPredictions: false,
        includedRegionCodes: ["my"],
        languageCode: "en",
      },
    }),
    locationQuerySuccess: (
      context,
      event: { latitude: number; longitude: number }
    ) => ({
      ...context,
      locationPermission: "granted",
      mapCoords: { latitude: event.latitude, longitude: event.longitude },
      originCoords: { latitude: event.latitude, longitude: event.longitude },
      originLocationInputText: "Current Location",
      originLocationResolvedText: "Current Location",
      originLocationBody: {
        ...context.originLocationBody,
        locationBias: {
          circle: {
            center: {
              latitude: event.latitude,
              longitude: event.longitude,
            },
            radius: 5000.0,
          },
        },
      },
    }),
    onInputChange: (context, event: { text: string }) => {
      const trimmed = event.text.trimStart();
      return {
        ...context,
        originLocationInputText: trimmed,
        originLocationBody: {
          ...context.originLocationBody,
          input: trimmed,
        },
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
      originLocationBody: {
        ...context.originLocationBody,
        input: event.placeName,
      },
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
          originLocationBody: {
            ...context.originLocationBody,
            locationBias: {
              circle: {
                center: {
                  latitude: event.latitude,
                  longitude: event.longitude,
                },
                radius: 5000.0,
              },
            },
          },
        };
      }
    },
  },
});

export default function Maps() {
  const queryClient = useQueryClient();

  const useLocationQuery = useLocation();

  const requestLocationMutation = requestLocation();

  const autocompleteLocationMutation = useMutation({
    mutationFn: (body: autocompleteCurrentLocationBody) => {
      return autocompleteLocation(body);
    },
    mutationKey: ["autocompleteLocation"],
  });

  const getCoordsByPlaceIdMutation = useMutation({
    mutationFn: getCoordsByPlaceId,
    mutationKey: ["getCoordsByPlaceId"],
  });

  const locationPermission = useSelector(
    mapPageStore,
    (state) => state.context.locationPermission
  );

  const mapCoords = useSelector(
    mapPageStore,
    (state) => state.context.mapCoords
  );

  const originCoords = useSelector(
    mapPageStore,
    (state) => state.context.originCoords
  );

  const autoCompleteSuggestions = useSelector(
    mapPageStore,
    (state) => state.context.autoCompleteSuggestions
  );

  const originLocationBody = useSelector(
    mapPageStore,
    (state) => state.context.originLocationBody
  );

  const overlayOpen = useSelector(
    mapPageStore,
    (state) => state.context.overlayOpen
  );

  const originLocationInputText = useSelector(
    mapPageStore,
    (state) => state.context.originLocationInputText
  );

  const debouncedOriginLocationBody = useDebounce(originLocationBody, 500);

  useEffect(() => {
    if (debouncedOriginLocationBody.input.length !== 0) {
      autocompleteLocationMutation.mutate(debouncedOriginLocationBody, {
        onSuccess: (data) => {
          mapPageStore.trigger.onAutocompleteMutationSuccess({ result: data });
        },
      });
    }
  }, [debouncedOriginLocationBody]);

  const region = {
    ...mapCoords,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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
    if (useLocationQuery.isFetching) {
      mapPageStore.trigger.locationQueryFetching();
    } else if (useLocationQuery.isSuccess) {
      mapPageStore.trigger.locationQuerySuccess({
        latitude: useLocationQuery.data.coords.latitude,
        longitude: useLocationQuery.data.coords.longitude,
      });
    }
  }, [useLocationQuery.isFetching, useLocationQuery.isSuccess]);

  const inputRef = useRef<TextInput>(null);

  return (
    <View className="flex-1">
      <KeyboardAvoidingView className="flex-1">
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="flex-row justify-between items-center gap-2 py-2 px-4">
            <YourLocationIconDisplay />
            <View className="relative w-72">
              <Input
                ref={inputRef}
                value={originLocationInputText}
                onChangeText={(text) =>
                  mapPageStore.trigger.onInputChange({ text })
                }
                onFocus={() => mapPageStore.trigger.onInputFocus()}
                onBlur={() => mapPageStore.trigger.onInputBlur()}
                className="w-full"
                placeholder="Enter location"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              ></Input>
              {overlayOpen && (
                <Animated.View
                  className="absolute top-full w-full z-50 bg-background border border-input rounded-md shadow-md mt-1"
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut}
                >
                  {autoCompleteSuggestions.length > 0 ? (
                    autoCompleteSuggestions.map((suggestion, index, arr) => (
                      <View key={"view" + index}>
                        <Button
                          key={"button" + index}
                          variant="ghost"
                          className="items-start h-auto py-3"
                          size="sm"
                          onPress={() => {
                            inputRef.current?.blur();
                            mapPageStore.trigger.onSelectOriginLocation({
                              placeName: suggestion.text,
                            });
                            getCoordsByPlaceIdMutation.mutate(
                              suggestion.placeId,
                              {
                                onSuccess: (data) => {
                                  mapPageStore.trigger.onGetCoordsByPlaceIdMutationSuccess(
                                    { coords: data }
                                  );
                                },
                              }
                            );
                          }}
                        >
                          <Text key={"text" + index}>{suggestion.text}</Text>
                        </Button>
                        {index != arr.length - 1 && (
                          <Separator
                            key={"separator" + index}
                            className="bg-accent"
                          />
                        )}
                      </View>
                    ))
                  ) : (
                    <View className="py-3">
                      <Text className="text-muted-foreground self-center">
                        No suggestions
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
            <Button
              size="icon"
              variant="ghost"
              disabled={
                locationPermission === "denied" ||
                locationPermission === "fetching"
              }
              onPress={() =>
                mapPageStore.trigger.onUseCurrentLocation({
                  latitude:
                    useLocationQuery?.data?.coords.latitude ??
                    mapCoords.latitude,
                  longitude:
                    useLocationQuery?.data?.coords.longitude ??
                    mapCoords.longitude,
                })
              }
            >
              {locationPermission === "denied" ? (
                <LocateOff className="text-destructive" />
              ) : locationPermission === "fetching" ? (
                <Locate className="text-muted-foreground" />
              ) : (
                <Locate className="text-primary" />
              )}
            </Button>
          </View>
          <View className="h-72 flex rounded-3xl">
            <MapView
              style={{ flex: 1, width: "100%", height: "100%" }}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              region={region}
            >
              {originCoords !== null && (
                <Marker coordinate={originCoords}>
                  <YourLocationIcon />
                </Marker>
              )}
            </MapView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

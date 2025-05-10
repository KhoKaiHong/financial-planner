import { TextInput, View } from "react-native";
import { YourLocationIconDisplay } from "./your-location-icon-display";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { useLocation } from "~/hooks/useLocation";
import { useEffect, useRef } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Coordinates, foodPageStore } from "~/store/foodPageStore";
import { useMutation } from "@tanstack/react-query";
import { LocateOff } from "~/lib/icons/LocateOff";
import { Locate } from "~/lib/icons/Locate";
import { useSelector } from "@xstate/store/react";
import { useDebounce } from "@uidotdev/usehooks";

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

export type autocompleteResult = {
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

export function LocationInput() {
  const inputRef = useRef<TextInput>(null);

  const getCoordsByPlaceIdMutation = useMutation({
    mutationFn: getCoordsByPlaceId,
    mutationKey: ["getCoordsByPlaceId"],
  });

  const autocompleteLocationMutation = useMutation({
    mutationFn: (body: autocompleteCurrentLocationBody) => {
      return autocompleteLocation(body);
    },
    mutationKey: ["autocompleteLocation"],
  });

  const useLocationQuery = useLocation();

  const originLocationInputText = useSelector(
    foodPageStore,
    (state) => state.context.originLocationInputText
  );

  const overlayOpen = useSelector(
    foodPageStore,
    (state) => state.context.overlayOpen
  );

  const autoCompleteSuggestions = useSelector(
    foodPageStore,
    (state) => state.context.autoCompleteSuggestions
  );

  const locationPermission = useSelector(
    foodPageStore,
    (state) => state.context.locationPermission
  );

  const mapCoords = useSelector(
    foodPageStore,
    (state) => state.context.mapCoords
  );

  const originCoords = useSelector(
    foodPageStore,
    (state) => state.context.originCoords
  );

  const originLocationBody: autocompleteCurrentLocationBody = {
    input: originLocationInputText,
    includeQueryPredictions: false,
    includedRegionCodes: ["my"],
    languageCode: "en",
    locationBias: originCoords
      ? {
          circle: {
            center: {
              latitude: originCoords.latitude,
              longitude: originCoords.longitude,
            },
            radius: 5000.0,
          },
        }
      : undefined,
  };

  const debouncedOriginLocationInputText = useDebounce(
    originLocationInputText,
    500
  );

  useEffect(() => {
    if (
      debouncedOriginLocationInputText.length !== 0 &&
      debouncedOriginLocationInputText !== "Current Location"
    ) {
      autocompleteLocationMutation.mutate(originLocationBody, {
        onSuccess: (data) => {
          foodPageStore.trigger.onAutocompleteMutationSuccess({ result: data });
        },
      });
    }
  }, [debouncedOriginLocationInputText]);

  return (
    <View className="flex-row justify-between items-center gap-2 py-2 px-6">
      <YourLocationIconDisplay />
      <View className="relative w-72">
        <Input
          ref={inputRef}
          value={originLocationInputText}
          onChangeText={(text) => foodPageStore.trigger.onInputChange({ text })}
          onFocus={() => foodPageStore.trigger.onInputFocus()}
          onBlur={() => foodPageStore.trigger.onInputBlur()}
          className="w-full rounded-full"
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
                      foodPageStore.trigger.onSelectOriginLocation({
                        placeName: suggestion.text,
                      });
                      getCoordsByPlaceIdMutation.mutate(suggestion.placeId, {
                        onSuccess: (data) => {
                          foodPageStore.trigger.onGetCoordsByPlaceIdMutationSuccess(
                            { coords: data }
                          );
                        },
                      });
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
          locationPermission === "denied" || locationPermission === "fetching"
        }
        onPress={() =>
          foodPageStore.trigger.onUseCurrentLocation({
            latitude:
              useLocationQuery?.data?.coords.latitude ?? mapCoords.latitude,
            longitude:
              useLocationQuery?.data?.coords.longitude ?? mapCoords.longitude,
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
  );
}

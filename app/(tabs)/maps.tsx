import { ScrollView, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { useLocation } from "~/hooks/useLocation";
import { requestLocation } from "~/hooks/requestLocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetch } from "expo/fetch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { TriggerRef } from "@rn-primitives/popover";
import { Input } from "~/components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type autocompleteCurrentLocationbody = {
  input: string;
  includeQueryPredictions: false;
  includedRegionCodes: ["my"];
  languageCode: "en";
  locationBias?: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: 5000.0;
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

// async function that fetches the autocomplete location data from the Google Maps API
async function autocompleteLocation(body: autocompleteCurrentLocationbody) {
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

export default function Maps() {
  const queryClient = useQueryClient();

  const useLocationQuery = useLocation();

  const requestLocationMutation = requestLocation();

  const originLocationMutation = useMutation({
    mutationFn: (body: autocompleteCurrentLocationbody) => {
      return autocompleteLocation(body);
    },
    mutationKey: ["originLocation"],
  });

  const getCoordsByPlaceIdMutation = useMutation({
    mutationFn: getCoordsByPlaceId,
    mutationKey: ["getCoordsByPlaceId"],
  });

  const [coords, setCoords] = useState<Coordinates>({
    latitude: 3.1319,
    longitude: 101.6841,
  });
  const [originLocation, setOriginLocation] = useState<Coordinates | null>(
    null
  );

  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    { placeId: string; text: string }[]
  >([]);

  const [originLocationBody, setOriginLocationBody] =
    useState<autocompleteCurrentLocationbody>({
      input: "",
      includeQueryPredictions: false,
      includedRegionCodes: ["my"],
      languageCode: "en",
    });

  const debouncedOriginLocationBody = useDebounce(originLocationBody, 500);

  const addLocationBias = useCallback((latitude: number, longitude: number) => {
    setOriginLocationBody((prevBody) => ({
      ...prevBody,
      locationBias: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: 5000.0,
        },
      },
    }));
  }, []);

  const setOriginLocationBodyInput = useCallback((input: string) => {
    setOriginLocationBody((prevBody) => ({
      ...prevBody,
      input: input,
    }));
  }, []);

  const triggerRef = useRef<TriggerRef>(null);

  const openPopOver = useCallback(() => {
    if (triggerRef.current) {
      triggerRef.current.open();
    }
  }, [triggerRef]);

  const closePopOver = useCallback(() => {
    if (triggerRef.current) {
      triggerRef.current.close();
    }
  }, [triggerRef]);

  const [originLocationInputText, setOriginLocationInputText] = useState("");

  useEffect(() => {
    if (debouncedOriginLocationBody.input.length !== 0) {
      originLocationMutation.mutate(debouncedOriginLocationBody, {
        onSuccess: (data) => {
          if (data === null) {
            setAutoCompleteSuggestions([]);
          } else {
            setAutoCompleteSuggestions(
              data.suggestions.map((suggestion) => {
                return {
                  placeId: suggestion.placePrediction.placeId,
                  text: suggestion.placePrediction.structuredFormat.mainText
                    .text,
                };
              })
            );
          }
        },
      });
    }
  }, [debouncedOriginLocationBody]);

  const handleTextChange = useCallback(
    (text: string) => {
      const trimmed = text.trimStart();
      setOriginLocationInputText(trimmed);
      setOriginLocationBodyInput(trimmed);
    },
    [setOriginLocationInputText]
  );

  const onPressText = () => {
    if (originLocationInputText === "Current Location") {
      setOriginLocationInputText("");
    }
    openPopOver();
  };

  const region = { ...coords, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

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
    if (useLocationQuery.isSuccess) {
      setCoords({
        latitude: useLocationQuery.data.coords.latitude,
        longitude: useLocationQuery.data.coords.longitude,
      });
      setOriginLocation({
        latitude: useLocationQuery.data.coords.latitude,
        longitude: useLocationQuery.data.coords.longitude,
      });
      setOriginLocationInputText("Current Location");
      addLocationBias(
        useLocationQuery.data.coords.latitude,
        useLocationQuery.data.coords.longitude
      );
    }
  }, [useLocationQuery.isSuccess]);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="flex-row justify-center py-2">
          <Popover>
            <PopoverTrigger ref={triggerRef}>
              <Input
                value={originLocationInputText}
                onChangeText={handleTextChange}
                onFocus={onPressText}
                onBlur={closePopOver}
                className="w-80"
                placeholder="Enter location"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              ></Input>
            </PopoverTrigger>
            <PopoverContent side={"bottom"} className="w-80 flex px-0 py-0">
              {autoCompleteSuggestions.length > 0 ? (
                autoCompleteSuggestions.map((suggestion, index, arr) => (
                  <View>
                    <Button
                      key={"button" + index}
                      variant="ghost"
                      className="items-start h-auto py-3"
                      size="sm"
                      onPress={() => {
                        triggerRef.current?.close();
                        setOriginLocationInputText(suggestion.text);
                        getCoordsByPlaceIdMutation.mutate(suggestion.placeId, {
                          onSuccess: (data) => {
                            setOriginLocation(data);
                          },
                        });
                      }}
                    >
                      <Text key={"text" + index}>{suggestion.text}</Text>
                    </Button>
                    {index != arr.length - 1 && (
                      <Separator className="bg-accent" />
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
            </PopoverContent>
          </Popover>
        </View>
        <View className="h-72 flex rounded-3xl">
          <MapView
            style={{ flex: 1, width: "100%", height: "100%" }}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            region={region}
          >
            {originLocation !== null && (
              <Marker coordinate={originLocation} pinColor="aqua" />
            )}
          </MapView>
        </View>
      </ScrollView>
    </View>
  );
}

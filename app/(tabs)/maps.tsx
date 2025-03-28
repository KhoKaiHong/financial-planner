import { Platform, View } from "react-native";
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
import { useDebounceCallback } from "usehooks-ts";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

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
  origin?: {
    latitude: number;
    longitude: number;
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

export default function Maps() {
  const { data, isError, error, isSuccess } = useLocation();
  const requestLocationMutation = requestLocation();

  const queryClient = useQueryClient();

  const [coords, setCoords] = useState<Coordinates>({
    latitude: 3.1319,
    longitude: 101.6841,
  });
  const [originLocation, setOriginLocation] = useState<Coordinates>(coords);

  const [originLocationSearch, setOriginLocationSearch] = useState("");

  const originLocationbody: autocompleteCurrentLocationbody = {
    input: "",
    includeQueryPredictions: false,
    includedRegionCodes: ["my"],
    languageCode: "en",
    ...(isSuccess && {
      locationBias: {
        circle: {
          center: {
            latitude: originLocation.latitude,
            longitude: originLocation.longitude,
          },
          radius: 5000.0,
        },
      },
    }),
  };

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

  const [text, setText] = useState("Current Location");

  const debouncedMutate = useCallback(
    useDebounceCallback((text: string) => {
      if (text.length !== 0) {
        originLocationMutation.mutate({
          ...originLocationbody,
          input: text,
        });
      }
    }, 500),
    []
  );

  const handleTextChange = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setText(trimmed);
      debouncedMutate(trimmed);
    },
    [setText, debouncedMutate]
  );

  const onPressText = () => {
    if (text === "Current Location") {
      setText("");
    }
    openPopOver();
  };

  const originLocationMutation = useMutation({
    mutationFn: (body: autocompleteCurrentLocationbody) => {
      return autocompleteLocation(body);
    },
    mutationKey: ["originLocation"],
  });

  const region = { ...coords, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

  useEffect(() => {
    if (isError && requestLocationMutation.isIdle) {
      if ("code" in error && error.code === "ERR_LOCATION_UNAUTHORIZED") {
        requestLocationMutation.mutate(undefined, {
          onSuccess: (data) => {
            if (data.granted) {
              queryClient.invalidateQueries({ queryKey: ["useLocation"] });
            }
          },
        });
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      setCoords({
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
      });
      setOriginLocation({
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
      });
      setChecked(true);
    }
  }, [isSuccess]);

  const [checked, setChecked] = useState<boolean | null>(null);

  return (
    <View className="flex-1">
      <View className="flex-row justify-center py-2">
        <Popover>
          <PopoverTrigger ref={triggerRef} asChild>
            <Input
              value={text}
              onChangeText={handleTextChange}
              onFocus={onPressText}
              onBlur={closePopOver}
              className="w-80"
              placeholder="Enter location"
            ></Input>
          </PopoverTrigger>
          <PopoverContent side={"bottom"} className="w-80 flex px-0 py-0">
            {originLocationMutation.data ? (
              originLocationMutation.data.suggestions.map(
                (suggestion, index, arr) => (
                  <View>
                    <Button
                      key={"button" + index}
                      variant="ghost"
                      className="items-start h-auto py-3"
                      size="sm"
                    >
                      <Text key={"text" + index}>
                        {
                          suggestion.placePrediction.structuredFormat.mainText
                            .text
                        }
                      </Text>
                    </Button>
                    {index != arr.length - 1 && (
                      <Separator className="bg-accent" />
                    )}
                  </View>
                )
              )
            ) : (
              <View className="py-3">
                <Text className="text-muted-foreground self-center">
                  No suggestions
                </Text>
              </View>
            )}
          </PopoverContent>
        </Popover>
        <Switch
          disabled={checked === null}
          checked={checked ?? false}
          onCheckedChange={setChecked}
          nativeID="use-current-location"
        />
        <Label nativeID="use-current-location">Use Current Location</Label>
      </View>
      <View className="h-72 flex rounded-3xl">
        <MapView
          style={{ flex: 1, width: "100%", height: "100%" }}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
        >
          <Marker coordinate={coords} pinColor="aqua" />
        </MapView>
      </View>
    </View>
  );
}

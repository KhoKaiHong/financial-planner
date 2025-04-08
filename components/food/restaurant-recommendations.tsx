import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import { useSelector } from "@xstate/store/react";
import { foodPageStore } from "~/store/foodPageStore";
import { Link, ExternalPathString } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Star } from "~/lib/icons/Star";
import { Banknote } from "~/lib/icons/Banknote";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { GeminiIcon } from "./gemini-icon";
import { Clock } from "~/lib/icons/Clock";
import { Navigation } from "~/lib/icons/Navigation";

export function RestaurantRecommendations() {
  const fetchingNearbyRestaurants = useSelector(
    foodPageStore,
    (state) => state.context.fetchingNearbyRestaurants
  );

  const restaurants = useSelector(
    foodPageStore,
    (state) => state.context.restaurants
  );

  return (
    <GestureScrollView
      className="rounded-t-3xl max-h-[22rem] h-full bg-accent mt-2"
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
      }}
    >
      {fetchingNearbyRestaurants ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            Fetching nearby restaurants. Please wait...
          </Text>
        </View>
      ) : restaurants === null ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            Please search for nearby restaurants
          </Text>
        </View>
      ) : restaurants.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">No restaurants found</Text>
        </View>
      ) : (
        restaurants.map((restaurant, index) => (
          <Card key={index} className="w-full mb-4 rounded-3xl">
            <CardHeader className="justify-center gap-2">
              <CardTitle className="text-lg">{restaurant.name}</CardTitle>
              <Text className="text-sm">{restaurant.type}</Text>
              {restaurant.openNow === undefined ? null : restaurant.openNow ? (
                <Badge variant="success" className="self-start w-auto">
                  <Text>Open now</Text>
                </Badge>
              ) : (
                <Badge variant="destructive" className="self-start w-auto">
                  <Text>Closed</Text>
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex-row gap-2 justify-between">
              <View className="flex gap-2 justify-center">
                <View className="flex-row gap-2">
                  <Star size={18} className="text-primary" />
                  <Text>{restaurant.rating} </Text>
                </View>
                {restaurant.priceStart && restaurant.priceEnd && (
                  <View className="flex-row gap-2">
                    <Banknote size={18} className="text-primary" />
                    <Text>
                      RM {restaurant.priceStart} - RM {restaurant.priceEnd}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row justify-center items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <GeminiIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-80 gap-4">
                    <Text className="text-lg font-inter-medium">
                      Restaurant Summary
                    </Text>
                    <View className="flex gap-2">
                      <Text>
                        <Text className="font-inter-semibold">
                          Review Summary:{" "}
                        </Text>
                        {restaurant.reviewSummary}
                      </Text>
                      <Text>
                        <Text className="font-inter-semibold">
                          Food Recommendations:{" "}
                        </Text>
                        {restaurant.foodRecommendation}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm text-muted-foreground">
                        Powered by Gemini
                      </Text>
                    </View>
                  </PopoverContent>
                </Popover>
                {restaurant.openingHours && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Clock size={18} className="text-primary" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-72 gap-4">
                      <Text className="text-lg font-inter-medium">
                        Opening Hours
                      </Text>
                      <View className="flex gap-2">
                        {restaurant.openingHours.map((openingHour, index) => (
                          <Text key={index} className="text-sm">
                            {openingHour}
                          </Text>
                        ))}
                      </View>
                    </PopoverContent>
                  </Popover>
                )}

                <Link href={restaurant.mapsUrl as ExternalPathString} asChild>
                  <Button className="text-primary" size="icon">
                    <Navigation size={18} className="text-primary-foreground" />
                  </Button>
                </Link>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </GestureScrollView>
  );
}

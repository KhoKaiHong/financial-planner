import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Coordinates, foodPageStore, Restaurant } from "~/store/foodPageStore";
import { useSelector } from "@xstate/store/react";
import { useMutation } from "@tanstack/react-query";
import { auth } from "~/firebaseConfig";
import {
  aiRestaurantResponse,
  RestaurantReviewBody,
} from "~/app/api/food-recommendation+api";

type getNearbyRestaurantsBody = {
  includedPrimaryTypes: string[];
  maxResultCount: number;
  locationRestriction: {
    circle: {
      center: {
        latitude: number;
        longitude: number;
      };
      radius: number;
    };
  };
  regionCode: string;
};

type nearbyRestaurantsResponse = {
  places: {
    displayName: {
      text: string;
    };
    types: string[];
    location: Coordinates;
    rating: number;
    googleMapsUri: string;
    priceRange?: {
      startPrice: {
        units: string;
      };
      endPrice: {
        units: string;
      };
    };
    regularOpeningHours?: {
      openNow: boolean;
      weekdayDescriptions: string[];
    };
    reviews?: {
      rating: number;
      text: {
        text: string;
      };
    }[];
  }[];
};

async function getNearbyRestaurants(body: getNearbyRestaurantsBody) {
  const resp = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        "X-Goog-FieldMask":
          "places.displayName.text,places.location,places.priceRange.startPrice.units,places.priceRange.endPrice.units,places.rating,places.googleMapsUri,places.reviews.rating,places.reviews.text.text,places.types,places.regularOpeningHours.openNow,places.regularOpeningHours.weekdayDescriptions",
      },
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const rawResult = await resp.json();

  if (Object.keys(rawResult).length !== 0) {
    const result = rawResult as nearbyRestaurantsResponse;

    const userIdToken = await auth.currentUser?.getIdToken();

    if (!userIdToken) {
      return [];
    }

    const reviews: RestaurantReviewBody = result.places.map((place) => ({
      name: place.displayName.text,
      types: place.types,
      reviews:
        place.reviews?.map((review) => ({
          rating: review.rating,
          text: review.text.text,
        })) ?? [],
    }));

    const aiResponse = await fetch(
      "http://192.168.100.61:8081/api/food-recommendation",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userIdToken}`,
        },
        method: "POST",
        body: JSON.stringify(reviews),
      }
    );

    const aiResult = (await aiResponse.json()) as aiRestaurantResponse;

    const restaurants: Restaurant[] = result.places.map((place) => ({
      name: place.displayName.text,
      type:
        aiResult.find(
          (restaurant) => restaurant.name === place.displayName.text
        )?.restaurantType ?? "",
      coordinates: place.location,
      rating: place.rating,
      mapsUrl: place.googleMapsUri,
      openNow: place.regularOpeningHours?.openNow,
      openingHours: place.regularOpeningHours?.weekdayDescriptions,
      priceStart: place.priceRange?.startPrice.units,
      priceEnd: place.priceRange?.endPrice.units,
      reviewSummary:
        aiResult.find(
          (restaurant) => restaurant.name === place.displayName.text
        )?.reviewSummary ?? "",
      foodRecommendation:
        aiResult.find(
          (restaurant) => restaurant.name === place.displayName.text
        )?.foodRecommendation ?? "",
    }));

    return restaurants;
  } else {
    return [];
  }
}

export function GetNearbyRestaurantsButton() {
  const getNearbyRestaurantsMutation = useMutation({
    mutationFn: getNearbyRestaurants,
    mutationKey: ["getNearbyRestaurants"],
  });

  const searchRadius = useSelector(
    foodPageStore,
    (state) => state.context.searchRadius
  );

  const mapCoords = useSelector(
    foodPageStore,
    (state) => state.context.mapCoords
  );

  const originCoords = useSelector(
    foodPageStore,
    (state) => state.context.originCoords
  );

  const fetchingNearbyRestaurants = useSelector(
    foodPageStore,
    (state) => state.context.fetchingNearbyRestaurants
  );

  const getNearbyRestaurantsBody: getNearbyRestaurantsBody = {
    includedPrimaryTypes: ["restaurant"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: {
          latitude: originCoords?.latitude ?? mapCoords.latitude,
          longitude: originCoords?.longitude ?? mapCoords.longitude,
        },
        radius: searchRadius * 1000,
      },
    },
    regionCode: "my",
  };

  return (
    <Button
      disabled={originCoords === null || fetchingNearbyRestaurants}
      onPress={() => {
        foodPageStore.trigger.onGetNearbyRestaurantsMutationStart();
        getNearbyRestaurantsMutation.mutate(getNearbyRestaurantsBody, {
          onSuccess: (data) => {
            foodPageStore.trigger.onGetNearbyRestaurantsMutationSuccess({
              restaurants: data,
            });
          },
        });
      }}
    >
      <Text>Get Nearby Restaurants</Text>
    </Button>
  );
}

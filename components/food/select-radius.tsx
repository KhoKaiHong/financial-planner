import { View } from "react-native";
import { Radar } from "~/lib/icons/Radar";
import { Text } from "~/components/ui/text";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import { foodPageStore } from "~/store/foodPageStore";
import { useSelector } from "@xstate/store/react";

export function SelectRadius() {
  const searchRadius = useSelector(
    foodPageStore,
    (state) => state.context.searchRadius
  );

  return (
    <View className="flex-row gap-2 items-center">
      <Radar className="text-primary" size={24} />
      <Select
        defaultValue={{ value: "1", label: "1" }}
        value={{
          value: searchRadius.toString(),
          label: searchRadius.toString(),
        }}
        onValueChange={(option) => {
          foodPageStore.trigger.onSelectSearchRadius({
            value: option?.value ?? "0",
          });
        }}
      >
        <SelectTrigger className="w-20">
          <SelectValue
            className="text-foreground text-sm native:text-lg"
            placeholder=""
          />
        </SelectTrigger>
        <SelectContent className="w-20">
          <GestureScrollView className="max-h-40">
            <SelectGroup>
              <SelectItem label="1" value="1">
                1
              </SelectItem>
              <SelectItem label="2" value="2">
                2
              </SelectItem>
              <SelectItem label="3" value="3">
                3
              </SelectItem>
              <SelectItem label="4" value="4">
                4
              </SelectItem>
              <SelectItem label="5" value="5">
                5
              </SelectItem>
              <SelectItem label="6" value="6">
                6
              </SelectItem>
              <SelectItem label="7" value="7">
                7
              </SelectItem>
              <SelectItem label="8" value="8">
                8
              </SelectItem>
              <SelectItem label="9" value="9">
                9
              </SelectItem>
              <SelectItem label="10" value="10">
                10
              </SelectItem>
            </SelectGroup>
          </GestureScrollView>
        </SelectContent>
      </Select>
      <Text className="text-lg">km</Text>
    </View>
  );
}

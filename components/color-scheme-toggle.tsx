import { Button } from "~/components/ui/button";
import { Sun } from "~/lib/icons/Sun";
import { MoonStar } from "~/lib/icons/MoonStar";
import { useColorScheme } from "~/lib/useColorScheme";

export function ColorSchemeToggle() {
  const { toggleColorScheme, colorScheme } = useColorScheme();

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onPressIn={() => {
        toggleColorScheme();
      }}
    >
      {colorScheme === "dark" ? (
        <MoonStar className="text-foreground" size={20} />
      ) : (
        <Sun className="text-foreground" size={20} />
      )}
    </Button>
  );
}

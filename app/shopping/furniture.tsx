import { Redirect } from "expo-router";

export default function ShoppingFurnitureRoute() {
  return (
    <Redirect
      href={{
        pathname: "/shopping/[category]",
        params: { category: "furniture" },
      }}
    />
  );
}

import { Redirect } from "expo-router";

export default function ShoppingPaintRoute() {
  return (
    <Redirect
      href={{
        pathname: "/shopping/[category]",
        params: { category: "paint" },
      }}
    />
  );
}

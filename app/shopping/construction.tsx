import { Redirect } from "expo-router";

export default function ShoppingConstructionRoute() {
  return (
    <Redirect
      href={{
        pathname: "/shopping/[category]",
        params: { category: "construction" },
      }}
    />
  );
}

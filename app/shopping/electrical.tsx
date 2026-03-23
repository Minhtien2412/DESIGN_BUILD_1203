import { Redirect } from "expo-router";

export default function ShoppingElectricalRoute() {
  return (
    <Redirect
      href={{
        pathname: "/shopping/[category]",
        params: { category: "electrical" },
      }}
    />
  );
}

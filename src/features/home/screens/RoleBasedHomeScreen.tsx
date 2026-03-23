import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { UserRole } from "@/types/role";

import RoleSwitcherDevOnly from "../components/RoleSwitcherDevOnly";
import CustomerHomeScreen from "./CustomerHomeScreen";
import InternalHomeScreen from "./InternalHomeScreen";
import WorkerHomeScreen from "./WorkerHomeScreen";

type RoleBasedHomeScreenProps = {
  role?: UserRole;
};

export default function RoleBasedHomeScreen({
  role,
}: RoleBasedHomeScreenProps) {
  const [devRole, setDevRole] = useState<UserRole>(role ?? "customer");
  const resolvedRole = role ?? devRole;

  const screen = useMemo(() => {
    switch (resolvedRole) {
      case "customer":
        return <CustomerHomeScreen />;
      case "worker":
        return <WorkerHomeScreen />;
      case "internal_manager":
        return <InternalHomeScreen />;
      default:
        return <CustomerHomeScreen />;
    }
  }, [resolvedRole]);

  return (
    <View style={styles.container}>
      {screen}
      {!role ? (
        <RoleSwitcherDevOnly value={resolvedRole} onChange={setDevRole} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

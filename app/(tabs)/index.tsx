/**
 * Home Screen — Role-based composition (4 independent homepages)
 *
 * Delegates to the correct HomeScreen based on the current role:
 *  - worker    → WorkerHomeScreen
 *  - engineer  → EngineerArchitectHomeScreen
 *  - contractor→ ContractorCompanyHomeScreen
 *  - customer  → CustomerHomeScreen (default)
 *
 * @refactored 2026-03-21 — Expanded from 2 roles to 4 independent homepages
 */

import { ContractorCompanyHomeScreen } from "@/components/role-home/contractor/ContractorCompanyHomeScreen";
import { CustomerHomeScreen } from "@/components/role-home/customer/CustomerHomeScreen";
import { EngineerArchitectHomeScreen } from "@/components/role-home/engineer/EngineerArchitectHomeScreen";
import { WorkerHomeScreen } from "@/components/role-home/worker/WorkerHomeScreen";
import { useRole } from "@/context/RoleContext";
import { StatusBar, View } from "react-native";

export default function HomeScreen() {
  const { role } = useRole();

  const renderHome = () => {
    switch (role) {
      case "worker":
        return <WorkerHomeScreen />;
      case "engineer":
        return <EngineerArchitectHomeScreen />;
      case "contractor":
        return <ContractorCompanyHomeScreen />;
      case "customer":
      default:
        return <CustomerHomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderHome()}
    </View>
  );
}

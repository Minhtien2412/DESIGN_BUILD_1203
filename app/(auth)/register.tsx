/**
 * Register Screen - Redirect to Modern Auth
 * This file redirects to the new combined auth screen with register mode
 */

import { Redirect } from "expo-router";

export default function RegisterRedirect() {
  return <Redirect href="/(auth)/auth" />;
}

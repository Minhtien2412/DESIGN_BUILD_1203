/**
 * Login Screen - Redirect to Modern Auth
 * This file redirects to the new combined auth screen
 */

import { Redirect } from "expo-router";

export default function LoginRedirect() {
  return <Redirect href="/(auth)/auth" />;
}

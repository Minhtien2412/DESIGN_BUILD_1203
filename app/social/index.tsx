/**
 * Social Feed Index - Redirects to social explore
 * Route: /social
 */

import { Redirect } from "expo-router";

export default function SocialIndex() {
  return <Redirect href="/social/explore" />;
}

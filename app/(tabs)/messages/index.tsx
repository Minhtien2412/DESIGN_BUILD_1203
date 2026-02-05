/**
 * Messages Index Screen
 * ======================
 *
 * Redirect to main messages list as default screen
 */

import { Redirect } from "expo-router";

export default function MessagesIndex() {
  return <Redirect href="/messages" />;
}

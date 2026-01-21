/**
 * Feng Shui Tool Redirect
 * Redirect to new Feng Shui AI screen
 */

import { Redirect } from 'expo-router';

export default function FengshuiScreen() {
  return <Redirect href={'/tools/feng-shui-ai' as any} />;
}

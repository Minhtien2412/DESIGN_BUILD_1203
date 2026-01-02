/**
 * Projects Index - Redirects to main projects tab
 * This file ensures /projects route works and redirects to main projects view
 * @route /projects
 */

import { Redirect } from 'expo-router';

export default function ProjectsIndexScreen() {
  // Redirect to main projects tab
  return <Redirect href="/(tabs)/projects" />;
}

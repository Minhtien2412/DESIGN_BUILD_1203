import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LoginScreen() {
  const router = useRouter();

  // Redirect to unified login screen
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login-unified" as any);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

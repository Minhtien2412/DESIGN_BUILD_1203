import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RegisterScreen() {
  const router = useRouter();

  // Redirect to unified register screen
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/register-unified" as any);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

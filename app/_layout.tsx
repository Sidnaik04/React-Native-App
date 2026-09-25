import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const rootSegment = segments[0];
  const isAuthRoute = rootSegment === "(auth)";
  const isTabsRoute = rootSegment === "(tabs)";
  const isOnboardingRoute = rootSegment === "onboarding";

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn && !isAuthRoute) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (isSignedIn && isAuthRoute) {
      router.replace(isOnboardingRoute ? "/onboarding" : "/(tabs)");
      return;
    }

    if (isSignedIn && !isTabsRoute && !isOnboardingRoute) {
      router.replace("/(tabs)");
    }
  }, [
    isAuthRoute,
    isLoaded,
    isOnboardingRoute,
    isSignedIn,
    isTabsRoute,
    router,
  ]);

  if (!fontsLoaded || !isLoaded) {
    return null;
  }

  return (
    <Stack
      initialRouteName={isSignedIn ? "(tabs)" : "(auth)"}
      screenOptions={{ headerShown: false }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootNavigator fontsLoaded={fontsLoaded} />
    </ClerkProvider>
  );
}

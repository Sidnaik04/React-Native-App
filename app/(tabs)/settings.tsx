import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="gap-4">
        <View className="rounded-3xl border border-border bg-card p-5">
          <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
          <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
            Manage your session and keep your account secure.
          </Text>

          <View className="mt-5 rounded-2xl border border-border bg-background p-4">
            <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
              Signed in as
            </Text>
            <Text className="mt-2 text-base font-sans-bold text-primary">
              {isLoaded
                ? (user?.primaryEmailAddress?.emailAddress ?? "Unknown account")
                : "Loading account..."}
            </Text>
          </View>

          <Pressable
            onPress={handleSignOut}
            disabled={isSigningOut}
            className="auth-button mt-5"
          >
            {isSigningOut ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="auth-button-text">Sign out</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;

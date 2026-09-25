import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";

export default function Onboarding() {
  const router = useRouter();

  return (
    <AuthShell
      title="Your account is ready"
      subtitle="A quick setup step keeps the dashboard focused on what matters most."
      helper="You can change these details later from the settings screen."
    >
      <View className="gap-4">
        <View className="rounded-3xl border border-border bg-background p-4">
          <Text className="text-base font-sans-bold text-primary">
            What happens next
          </Text>
          <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
            We’ll take you to your subscription dashboard, where you can review
            upcoming renewals and manage billing details.
          </Text>
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="auth-button"
        >
          <Text className="auth-button-text">Continue to dashboard</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

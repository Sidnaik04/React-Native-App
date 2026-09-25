import { styled } from "nativewind";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
  title: string;
  subtitle: string;
  helper?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  helper,
  children,
  footer,
}: AuthShellProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="absolute -right-20 -top-24 size-72 rounded-full bg-accent/10" />
      <View className="absolute -bottom-28 -left-24 size-80 rounded-full bg-primary/5" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>

                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>

              <Text className="auth-title">{title}</Text>
              <Text className="auth-subtitle">{subtitle}</Text>
              {helper ? (
                <Text className="mt-3 max-w-[320px] text-center text-sm font-sans-medium text-muted-foreground">
                  {helper}
                </Text>
              ) : null}
            </View>

            <View className="auth-card">{children}</View>

            {footer ? <View>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

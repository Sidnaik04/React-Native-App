import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import AuthField from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import { extractClerkMessage, validateEmail } from "@/lib/auth";

type SignInFormErrors = {
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

export default function SignIn() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [stage, setStage] = useState<"credentials" | "code">("credentials");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<SignInFormErrors>({});

  const isSubmitting = fetchStatus === "fetching";
  const helperText =
    stage === "code"
      ? "We sent a verification code to protect this account."
      : "Use the email and password attached to your billing workspace.";

  const clearError = (field: keyof SignInFormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const finishSignIn = async () => {
    await signIn.finalize({
      navigate: () => {
        router.replace("/(tabs)");
      },
    });
  };

  const handleSignIn = async () => {
    const nextErrors: SignInFormErrors = {};

    const emailError = validateEmail(emailAddress);
    const passwordError = password.trim() ? undefined : "Enter your password.";

    if (emailError) {
      nextErrors.email = emailError;
    }

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setErrors({
        form: extractClerkMessage(error, "Check your details and try again."),
      });
      return;
    }

    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const emailFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailFactor) {
        await signIn.mfa.sendEmailCode();
        setStage("code");
        setErrors({ form: "Enter the one-time code sent to your inbox." });
        return;
      }

      setErrors({
        form: "This account needs a second verification step that is not enabled here.",
      });
      return;
    }

    setErrors({ form: "Sign-in is not complete. Please try again." });
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setErrors({ code: "Enter the verification code." });
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (error) {
      setErrors({
        form: extractClerkMessage(error, "That code did not work. Try again."),
      });
      return;
    }

    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    setErrors({
      form: "Verification finished, but the session was not activated.",
    });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing every subscription in one place."
      helper={helperText}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurly?</Text>
          <Link href="/(auth)/sign-up" className="auth-link">
            Create account
          </Link>
        </View>
      }
    >
      {stage === "credentials" ? (
        <View className="auth-form">
          <AuthField
            label="Email"
            value={emailAddress}
            onChangeText={(value) => {
              setEmailAddress(value);
              clearError("email");
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            errorMessage={errors.email}
          />

          <AuthField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError("password");
            }}
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            errorMessage={errors.password}
          />

          {errors.form ? (
            <Text className="auth-error">{errors.form}</Text>
          ) : null}

          <Pressable
            onPress={handleSignIn}
            disabled={isSubmitting}
            className="auth-button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="auth-button-text">Sign in</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          <AuthField
            label="Verification code"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              clearError("code");
            }}
            placeholder="Enter the code we sent"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            errorMessage={errors.code}
          />

          {errors.form ? (
            <Text className="auth-error">{errors.form}</Text>
          ) : null}

          <Pressable
            onPress={handleVerify}
            disabled={isSubmitting}
            className="auth-button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="auth-button-text">Verify and continue</Text>
            )}
          </Pressable>

          <Pressable
            onPress={async () => {
              await signIn.mfa.sendEmailCode();
              setErrors({ form: "A new code has been sent." });
            }}
            disabled={isSubmitting}
            className="auth-secondary-button"
          >
            <Text className="auth-secondary-button-text">Send a new code</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setStage("credentials");
              setCode("");
              setErrors({});
            }}
            className="items-center"
          >
            <Text className="auth-link">Use a different email</Text>
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}

import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import AuthField from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import {
  extractClerkMessage,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

type SignUpFormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  form?: string;
};

export default function SignUp() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const [stage, setStage] = useState<"details" | "code">("details");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<SignUpFormErrors>({});

  const isSubmitting = fetchStatus === "fetching";

  const clearError = (field: keyof SignUpFormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const finishSignUp = async () => {
    await signUp.finalize({
      navigate: () => {
        router.replace("/onboarding");
      },
    });
  };

  const handleSignUp = async () => {
    const nextErrors: SignUpFormErrors = {};

    const emailError = validateEmail(emailAddress);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);

    if (emailError) {
      nextErrors.email = emailError;
    }

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (confirmError) {
      nextErrors.confirmPassword = confirmError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setErrors({
        form: extractClerkMessage(error, "Check your details and try again."),
      });
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();

    if (sendError) {
      setErrors({
        form: extractClerkMessage(
          sendError,
          "We could not send the verification code.",
        ),
      });
      return;
    }

    setStage("code");
    setErrors({
      form: "Enter the code we sent to finish creating your account.",
    });
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setErrors({ code: "Enter the verification code." });
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      setErrors({
        form: extractClerkMessage(error, "That code did not work. Try again."),
      });
      return;
    }

    if (signUp.status === "complete") {
      await finishSignUp();
      return;
    }

    setErrors({
      form: "Verification finished, but the session was not activated.",
    });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your workspace in under a minute and keep every subscription organized."
      helper={
        stage === "code"
          ? "This step confirms the email you’ll use for billing updates and renewal alerts."
          : "We only ask for what we need to secure your account."
      }
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" className="auth-link">
            Sign in
          </Link>
        </View>
      }
    >
      {stage === "details" ? (
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
            placeholder="Create a password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            helperText="Use at least 8 characters with letters and numbers."
            errorMessage={errors.password}
          />

          <AuthField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            placeholder="Repeat your password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="password"
            errorMessage={errors.confirmPassword}
          />

          {errors.form ? (
            <Text className="auth-error">{errors.form}</Text>
          ) : null}

          <Pressable
            onPress={handleSignUp}
            disabled={isSubmitting}
            className="auth-button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="auth-button-text">Create account</Text>
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
              await signUp.verifications.sendEmailCode();
              setErrors({ form: "A new code has been sent." });
            }}
            disabled={isSubmitting}
            className="auth-secondary-button"
          >
            <Text className="auth-secondary-button-text">Send a new code</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setStage("details");
              setCode("");
              setErrors({});
            }}
            className="items-center"
          >
            <Text className="auth-link">Edit account details</Text>
          </Pressable>
        </View>
      )}
    </AuthShell>
  );
}

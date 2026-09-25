import { clsx } from "clsx";
import { Text, TextInput, TextInputProps, View } from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorMessage?: string;
  className?: string;
};

export default function AuthField({
  label,
  helperText,
  errorMessage,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        className={clsx(
          "auth-input",
          errorMessage && "auth-input-error",
          className,
        )}
        placeholderTextColor="rgba(8, 17, 38, 0.35)"
        {...props}
      />
      {errorMessage ? (
        <Text className="auth-error">{errorMessage}</Text>
      ) : helperText ? (
        <Text className="auth-helper">{helperText}</Text>
      ) : null}
    </View>
  );
}

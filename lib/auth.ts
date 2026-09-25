const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string) {
  const email = value.trim();

  if (!email) {
    return "Enter your email address.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  return undefined;
}

export function validatePassword(value: string) {
  if (!value) {
    return "Enter a password.";
  }

  if (value.length < 8) {
    return "Use at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Use letters and numbers for a stronger password.";
  }

  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
) {
  if (!confirmPassword) {
    return "Confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return undefined;
}

export function extractClerkMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const maybeErrors = (error as Record<string, unknown>).errors as
    | { message?: string; longMessage?: string }[]
    | undefined;

  const firstMessage =
    maybeErrors?.[0]?.longMessage ?? maybeErrors?.[0]?.message;

  return firstMessage ?? fallback;
}

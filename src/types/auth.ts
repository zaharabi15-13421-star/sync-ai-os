export type AuthScreen =
  | "entry"
  | "register"
  | "verify"
  | "success"
  | "login"
  | "forgot"
  | "reset-verify"
  | "reset-password";

export type AuthTab = "signup" | "login";

export interface RegistrationFormValues {
  companyName: string;
  email: string;
  industry: string;
  teamSize: string;
  websiteUrl: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationFormValues, string>>;

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: PasswordStrengthLevel;
  label: string;
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const INDUSTRIES = [
  "E-commerce",
  "Retail",
  "Education",
  "Healthcare",
  "Technology",
  "Finance",
  "Food and Beverage",
  "Fashion",
  "Real Estate",
  "Marketing Agency",
  "Manufacturing",
  "Other",
] as const;

export const TEAM_SIZES = [
  "Just me",
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
] as const;

import type { PasswordStrength, PasswordStrengthLevel } from "@/types/auth";

const LABELS = ["", "Weak", "Fair", "Strong", "Very strong"];
const COLORS = [
  "transparent",
  "#EF4444", // Weak
  "#F59E0B", // Fair
  "#22C55E", // Strong
  "#16A34A", // Very strong
];

export function scorePassword(pw: string): PasswordStrength {
  const hasMinLength = pw.length >= 8;
  const hasUppercase = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  // If password is empty, score is 0
  if (!pw) score = 0;

  const s = score as PasswordStrengthLevel;
  return {
    score: s,
    label: LABELS[s] ?? "",
    color: COLORS[s] ?? "transparent",
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  };
}

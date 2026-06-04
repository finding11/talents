export function formatRegisterError(error: unknown, detail?: string): string {
  if (typeof error === "string") {
    return detail && error === "Registration failed" ? `${error}: ${detail}` : error;
  }

  if (Array.isArray(error)) {
    const messages = error
      .map((item) => {
        if (typeof item === "object" && item && "message" in item) {
          const path = "path" in item && Array.isArray(item.path) ? item.path.join(".") : "";
          return path ? `${path}: ${String(item.message)}` : String(item.message);
        }
        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) return messages.join(" ");
  }

  return detail ? `Registration failed: ${detail}` : "Registration failed. Please try again.";
}

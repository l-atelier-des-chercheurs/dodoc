export function resolveAppPublicOrigin() {
  const public_url = window.app_infos?.public_url;
  if (public_url && typeof public_url === "string" && public_url.trim()) {
    try {
      return new URL(public_url.trim().replace(/\/+$/, "")).origin;
    } catch (err) {}
  }
  return window.location.origin;
}

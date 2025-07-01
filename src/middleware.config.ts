// JWT token verification helper
export const verifyAdminJWT = (token?: string | null) => {
  if (!token) return false;
  try {
    // Verify token using your JWT library and secret
    // This should match the verification in your admin middleware
    return true; // TODO: Implement actual JWT verification
  } catch (error) {
    return false;
  }
}

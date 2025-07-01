export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [], // configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");
      const isOnOrders = nextUrl.pathname.startsWith("/orders");
      
      // Admin routes are handled by separate JWT middleware
      if (nextUrl.pathname.startsWith("/admin")) {
        return false; // Let admin middleware handle these routes
      }

      if (isOnCheckout || isOnOrders) {
        // Must be logged in to checkout or view orders
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies import("next-auth").NextAuthConfig

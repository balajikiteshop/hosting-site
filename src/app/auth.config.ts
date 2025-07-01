export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [], // configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");
      const isOnOrders = nextUrl.pathname.startsWith("/orders");
      
      if (isOnAdmin) {
        // Only admin emails can access admin pages
        const isAdmin = auth?.user?.email?.endsWith("@balajikitehouse.com");
        return isAdmin;
      }

      if (isOnCheckout || isOnOrders) {
        // Must be logged in to checkout or view orders
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies import("next-auth").NextAuthConfig

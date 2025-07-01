import NextAuth from "next-auth";
import { authConfig } from "./config";

export const { auth, signIn, signOut } = NextAuth(authConfig);

export const getAuthSession = async () => {
  return await auth();
};

export const requireAuth = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
};

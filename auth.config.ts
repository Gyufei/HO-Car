import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!username || !password) {
          return null;
        }

        const envUsername = process.env.ADMIN_USERNAME;
        const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!envUsername || !envPasswordHash) {
          console.error("ADMIN_USERNAME or ADMIN_PASSWORD_HASH is not set");
          return null;
        }

        if (username !== envUsername) {
          return null;
        }

        const isValid = await bcrypt.compare(password, envPasswordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: "single-user",
          name: "Home Calc User",
          email: "user@example.com",
        };
      },
    }),
  ],
};


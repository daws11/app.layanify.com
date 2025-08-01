import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tier?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    tier?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    tier?: string;
  }
}

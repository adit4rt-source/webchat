import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",").filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = (profile as any).id;
        token.username = (profile as any).username;
        token.avatar = (profile as any).avatar;
        token.isAdmin = ADMIN_IDS.includes((profile as any).id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

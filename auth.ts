import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { verifyPassword } from "@/lib/security/password";

const credentialsSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(256),
});

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: getCloudflareEnv().AUTH_SECRET,
  trustHost: true,
  useSecureCookies: true,
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-pošta", type: "email" },
        password: { label: "Geslo", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const env = getCloudflareEnv();
        if (parsed.data.email !== env.ADMIN_EMAIL.toLowerCase()) return null;
        if (!(await verifyPassword(parsed.data.password, env.ADMIN_PASSWORD_HASH))) return null;
        return { id: "eventaj-admin", email: env.ADMIN_EMAIL, name: "Eventaj Admin" };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      if (!request.nextUrl.pathname.startsWith("/admin")) return true;
      return Boolean(session?.user?.email);
    },
  },
  events: {
    async signIn({ user }) {
      const env = getCloudflareEnv();
      await env.DB.prepare(
        `INSERT INTO audit_logs
          (id, actor_type, actor_id, action, target_type, target_id, created_at)
         VALUES (?, 'user', ?, 'auth.signed_in', 'session', ?, ?)`,
      ).bind(crypto.randomUUID(), user.email, crypto.randomUUID(), new Date().toISOString()).run();
    },
  },
}));

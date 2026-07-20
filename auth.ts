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
        if (parsed.data.email === env.ADMIN_EMAIL.toLowerCase()
          && await verifyPassword(parsed.data.password, env.ADMIN_PASSWORD_HASH)) {
          return {
            id: "eventaj-admin", email: env.ADMIN_EMAIL, name: "Eventaj Admin",
            organizationId: env.ORGANIZATION_ID, role: "platform_admin", platformAdmin: true,
          };
        }
        const member = await env.DB.prepare(
          `SELECT u.id, u.email, u.name, u.password_hash, om.organization_id, om.role
           FROM users u JOIN organization_members om ON om.user_id = u.id
           JOIN organizations o ON o.id = om.organization_id
           WHERE u.email = ? AND u.status = 'active' AND om.status = 'active' AND o.status = 'active'
           ORDER BY CASE om.role WHEN 'owner' THEN 0 ELSE 1 END LIMIT 1`,
        ).bind(parsed.data.email).first<{
          id: string; email: string; name: string; password_hash: string;
          organization_id: string; role: "owner" | "event_manager";
        }>();
        if (!member || !(await verifyPassword(parsed.data.password, member.password_hash))) return null;
        return {
          id: member.id, email: member.email, name: member.name,
          organizationId: member.organization_id, role: member.role, platformAdmin: false,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const authorized = user as typeof user & {
          organizationId: string; role: string; platformAdmin: boolean;
        };
        token.userId = user.id;
        token.organizationId = authorized.organizationId;
        token.role = authorized.role;
        token.platformAdmin = authorized.platformAdmin;
      }
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, {
        userId: token.userId,
        organizationId: token.organizationId,
        role: token.role,
        platformAdmin: token.platformAdmin,
      });
      return session;
    },
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

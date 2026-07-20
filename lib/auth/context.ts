import { auth } from "@/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";

export type AuthContext = {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  role: "owner" | "event_manager" | "platform_admin";
  platformAdmin: boolean;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  const user = session?.user as ({
    email?: string | null;
    name?: string | null;
  } & Partial<AuthContext>) | undefined;
  if (!user?.email) return null;
  // Backward compatibility for the legacy Eventaj JWT during the first deploy.
  let legacyOrganizationId = "eventaj";
  try { legacyOrganizationId = getCloudflareEnv().ORGANIZATION_ID ?? legacyOrganizationId; } catch { /* unit/local fallback */ }
  return {
    userId: user.userId ?? "eventaj-admin",
    email: user.email,
    name: user.name ?? user.email,
    organizationId: user.organizationId ?? legacyOrganizationId,
    role: user.role ?? "platform_admin",
    platformAdmin: user.platformAdmin ?? true,
  };
}

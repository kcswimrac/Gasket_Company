import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const sql = getSQL();
          const rows = await sql`
            SELECT id, name, email, password_hash, role, active
            FROM admin_users
            WHERE email = ${email}
            LIMIT 1
          `;

          if (rows.length === 0) return null;

          const user = rows[0];
          if (!user.active) return null;

          const hash = await sha256(password + "_backyard_salt");
          if (hash !== user.password_hash) return null;

          // Update last login
          await sql`
            UPDATE admin_users SET last_login_at = NOW() WHERE id = ${user.id}
          `;

          return {
            id: user.id as string,
            name: user.name as string,
            email: user.email as string,
            role: user.role as string,
          };
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
    Credentials({
      id: "customer-login",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        try {
          const sql = getSQL();
          const rows = await sql`
            SELECT id, name, email, password_hash
            FROM customers
            WHERE email = ${email}
              AND password_hash IS NOT NULL
              AND deleted_at IS NULL
            LIMIT 1
          `;

          if (rows.length === 0) return null;

          const customer = rows[0];
          const hash = await sha256(password + "_backyard_customer_salt");
          if (hash !== customer.password_hash) return null;

          // Update last activity
          await sql`
            UPDATE customers SET last_activity_at = NOW() WHERE id = ${customer.id}
          `;

          return {
            id: customer.id as string,
            name: customer.name as string,
            email: customer.email as string,
            role: "customer",
          };
        } catch (e) {
          console.error("Customer auth error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

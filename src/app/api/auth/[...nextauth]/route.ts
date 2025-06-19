
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

// Move customers data to a separate file or database in production
const customers = [
  {
    id: "2",
    email: "wintahboke@gmail.com",
    fullName: "Anita Boke",
    password: "wintah",
  },
  {
    id: "3",
    email: "bethwel@gmail.com",
    fullName: "Bethwel",
    password: "Ambass",
  },
] as const;

// Admin credentials should come from environment variables in production
const ADMIN_CREDENTIALS = {
  email: "admin@bank.com",
  password: "wintah",
  id: "1",
  name: "Admin",
  role: "admin" as const,
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Banking System",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "user@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Admin login
        if (
          credentials.email === ADMIN_CREDENTIALS.email &&
          credentials.password === ADMIN_CREDENTIALS.password
        ) {
          return ADMIN_CREDENTIALS;
        }

        // Customer login
        const customer = customers.find(
          (c) => c.email === credentials.email
        );

        if (!customer) {
          throw new Error("No user found with this email");
        }

        if (customer.password !== credentials.password) {
          throw new Error("Incorrect password");
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.fullName,
          role: "customer" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "customer";
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60 // Update session once per day
  },
   cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
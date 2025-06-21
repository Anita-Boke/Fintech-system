// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type UserRole = "admin" | "customer";

// Interface for your user data
interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; }

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "banking-credentials",
      name: "Banking System",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "user@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "••••••••" 
        },
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        
        const mockUsers: AppUser[] = [
          {
            id: "1",
            email: "admin@bank.com",
            password: "wintah", 
            name: "Admin User",
            role: "admin"
          },
          {
            id: "2",
            email: "wintahboke@gmail.com",
            password: "wintah",
            name: "Regular Customer",
            role: "customer"
          },
          {
    id: "3",
    email: "bethwel@gmail.com",
    password: "Ambass",
     name: "Regular Customer",
     role: "customer"
  },
        ];

        const user = mockUsers.find(user => user.email === credentials.email);
        
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = user.password === credentials.password;
        
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Return user data without password
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
 callbacks: {
  async jwt({ token, user }) {  // Removed trigger
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.email = user.email;
      token.name = user.name;
    }
    return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login?error", // Redirect with error query parameter
    newUser: "/register" // If you have registration
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60 // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};
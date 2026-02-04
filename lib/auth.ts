import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
           throw new Error("Invalid credentials");
        }
        
        if (!user.password) {
           throw new Error("Please sign in with Google or your previously used provider.");
        }

        if (user.status === 'blocked') {
           throw new Error("Your account has been blocked.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        console.log("Authorize Login Success. User Role from DB:", user.role);
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
              if (existingUser.status === 'blocked') {
                  return false; // Block access
              }
          } else if (user.email) {
            // Create new user
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
        if (session.user) {
            (session.user as any).role = token.role;
            (session.user as any).id = token.id;
        }
        return session;
    },
    async jwt({ token, user, trigger, session }) {
        // Log removed to reduce noise, but logic kept
        if (trigger === "update" && session?.role) {
             token.role = session.role;
        }

        if (user || !token.role || trigger === 'update') {
           await dbConnect();
           if (token.email) {
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                    token.status = dbUser.status;
                }
           }
        }
        return token;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

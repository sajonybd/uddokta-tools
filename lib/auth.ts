import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ImpersonationToken from "@/models/ImpersonationToken";
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
        impersonateToken: { label: "Impersonate Token", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (credentials?.impersonateToken) {
          const tokenDoc = await ImpersonationToken.findOne({ token: credentials.impersonateToken });
          if (!tokenDoc) {
            throw new Error("Invalid or expired impersonation token");
          }

          const user = await User.findById(tokenDoc.userId);
          const adminUserId = tokenDoc.adminUserId;

          // Consume token
          await ImpersonationToken.deleteOne({ _id: tokenDoc._id });

          if (!user) {
            throw new Error("User not found");
          }

          if (user.status === 'blocked') {
            throw new Error("Your account has been blocked.");
          }

          console.log("Authorize Impersonation Success. User Role from DB:", user.role);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            customId: user.customId,
            originalAdminId: adminUserId ? adminUserId.toString() : undefined,
          } as any;
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

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
            const { getNextUserId } = await import("@/lib/user-utils");
            const customId = await getNextUserId();

            const { cookies } = await import("next/headers");
            let referredByUserId = undefined;
            try {
              const cookieStore = await cookies();
              const referredByCookie = cookieStore.get("referredBy")?.value;
              if (referredByCookie) {
                const referrer = await User.findOne({ customId: Number(referredByCookie) });
                if (referrer) {
                  referredByUserId = referrer._id;
                }
              }
            } catch (err) {
              console.error("Failed to read referredBy cookie in OAuth flow:", err);
            }

            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              customId,
              referredBy: referredByUserId,
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
            (session.user as any).customId = token.customId;
            (session.user as any).isImpersonated = token.isImpersonated;
            (session.user as any).originalAdminId = token.originalAdminId;
        }
        console.log("NextAuth Session Callback. User:", session.user);
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
                    // Retroactive ID assignment if missing
                    if (!dbUser.customId) {
                        const { getNextUserId } = await import("@/lib/user-utils");
                        dbUser.customId = await getNextUserId();
                        await dbUser.save();
                        console.log(`Retroactively assigned UID ${dbUser.customId} to ${dbUser.email}`);
                    }

                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                    token.status = dbUser.status;
                    token.customId = dbUser.customId;
                }
           }
        }

        if (user && (user as any).originalAdminId) {
            token.originalAdminId = (user as any).originalAdminId;
            token.isImpersonated = true;
        }

        console.log("NextAuth JWT Callback. Token isImpersonated:", token.isImpersonated, "originalAdminId:", token.originalAdminId);
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

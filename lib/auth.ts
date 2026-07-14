import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ImpersonationToken from "@/models/ImpersonationToken";
import bcrypt from "bcryptjs";
import DeviceSession from "@/models/DeviceSession";
import AuthLog from "@/models/AuthLog";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        impersonateToken: { label: "Impersonate Token", type: "text" },
        firebaseIdToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();

        // 1. Firebase OTP Flow
        if (credentials?.firebaseIdToken) {
          const { adminAuth } = await import('@/lib/firebase-admin');
          try {
            const decodedToken = await adminAuth.verifyIdToken(credentials.firebaseIdToken);
            const phoneNumber = decodedToken.phone_number;

            if (!phoneNumber) {
              throw new Error("No phone number found in token");
            }

            let user = await User.findOne({ phone: phoneNumber });
            
            if (!user) {
              // If user doesn't exist, we might create them or throw an error based on requirements.
              // Assuming new users can be created here if not found.
              const { getNextUserId } = await import("@/lib/user-utils");
              const customId = await getNextUserId();
              user = await User.create({
                phone: phoneNumber,
                phoneVerified: true,
                customId,
                name: "User " + phoneNumber.substring(phoneNumber.length - 4),
                provider: 'phone',
              });
            } else if (!user.phoneVerified) {
               user.phoneVerified = true;
               await user.save();
            }

            if (user.status === 'blocked') {
              throw new Error("Your account has been blocked.");
            }

            // Device limits will be handled in the JWT callback
            return {
              id: user._id.toString(),
              email: user.email, // might be undefined
              phone: user.phone,
              phoneVerified: user.phoneVerified,
              name: user.name,
              role: user.role,
              customId: user.customId,
            } as any;

          } catch (error) {
            console.error("Firebase ID Token verification error:", error);
            throw new Error("Invalid OTP token");
          }
        }

        // 2. Impersonation Flow
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
            phone: user.phone,
            phoneVerified: user.phoneVerified,
            name: user.name,
            role: user.role,
            customId: user.customId,
            originalAdminId: adminUserId ? adminUserId.toString() : undefined,
          } as any;
        }

        // 3. Email/Phone + Password Flow
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // The "email" credential field might contain an email or a phone number.
        const identifier = credentials.email;
        const user = await User.findOne({
          $or: [{ email: identifier }, { phone: identifier }]
        }).select("+password");

        if (!user) {
           throw new Error("Invalid credentials");
        }
        
        if (!user.password) {
           throw new Error("Please sign in with Google or your previously used provider.");
        }

        if (user.status === 'blocked') {
           throw new Error("Your account has been blocked.");
        }

        // Device limits will be handled in the JWT callback
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        console.log("Authorize Login Success. User Role from DB:", user.role);
        // Note: if user.phoneVerified is false, we still return the user, 
        // but middleware will catch it.
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
              phoneVerified: false, // Default for Google new users
            });
            // newly created user has 0 sessions
          }
          
          // Device limits will be handled in the JWT callback          
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
            (session.user as any).phone = token.phone;
            (session.user as any).phoneVerified = token.phoneVerified;
            (session.user as any).deviceLimitWarning = token.deviceLimitWarning;
        }
        console.log("NextAuth Session Callback. User:", session.user);
        return session;
    },
    async jwt({ token, user, trigger, session }) {
        if (trigger === "update" && session?.role) {
             token.role = session.role;
        }
        if (trigger === "update" && session?.phoneVerified) {
             token.phoneVerified = session.phoneVerified;
             token.phone = session.phone;
        }

        if (user || !token.role || trigger === 'update') {
           await dbConnect();
           // Find user by email OR phone depending on what we have
           let dbUser = null;
           if (token.email) {
             dbUser = await User.findOne({ email: token.email });
           } else if (token.phone) {
             dbUser = await User.findOne({ phone: token.phone });
           }

           if (dbUser) {
               // Retroactive ID assignment if missing
               if (!dbUser.customId) {
                   const { getNextUserId } = await import("@/lib/user-utils");
                   dbUser.customId = await getNextUserId();
                   await dbUser.save();
                   console.log(`Retroactively assigned UID ${dbUser.customId}`);
               }

               token.role = dbUser.role;
               token.id = dbUser._id.toString();
               token.status = dbUser.status;
               token.customId = dbUser.customId;
               token.phone = dbUser.phone;
               token.phoneVerified = dbUser.phoneVerified;
           }
        }
        
        // Session limit tracking
        if (user && token.id) {
           // This runs on initial sign in
           await dbConnect();
           
           let deviceLimitWarning = false;
           // We need to fetch the maxDevices from user in db
           const dbUser = await User.findById(token.id);
           if (dbUser) {
               const maxDevices = dbUser.maxDevices || 1;
               const activeSessionsCount = await DeviceSession.countDocuments({ userId: token.id, status: 'active' });
               
               if (dbUser.role !== 'admin' && activeSessionsCount >= maxDevices) {
                   // Revoke all existing active sessions
                   await DeviceSession.updateMany({ userId: token.id, status: 'active' }, { $set: { status: 'revoked' } });
                   deviceLimitWarning = true;
               }
           }

           const sessionId = uuidv4();
           let ip = "Unknown IP";
           let userAgent = "Unknown Device";
           try {
               const headersList = await headers();
               ip = headersList.get("x-forwarded-for") || "Unknown IP";
               userAgent = headersList.get("user-agent") || "Unknown Device";
           } catch(e) {}

           await DeviceSession.create({
               userId: token.id,
               sessionId,
               ip,
               userAgent,
               status: 'active'
           });
           
           await AuthLog.create({
               userId: token.id,
               action: 'login',
               ip,
               userAgent,
               deviceLimitTriggered: deviceLimitWarning
           });

           token.sessionId = sessionId;
           token.deviceLimitWarning = deviceLimitWarning;
        } else if (token.sessionId) {
           // This runs on subsequent requests
           await dbConnect();
           const validSession = await DeviceSession.findOne({ sessionId: token.sessionId, status: 'active' });
           if (!validSession) {
               throw new Error("SessionRevoked");
           }
           // Optionally update lastActive
           // await DeviceSession.updateOne({ sessionId: token.sessionId }, { lastActive: new Date() });
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

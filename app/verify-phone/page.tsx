"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VerifyPhonePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (err: any) => {
    console.error("Auth Error:", err);
    let errorMsg = err?.message || "An unexpected error occurred.";
    
    if (errorMsg.includes("auth/too-many-requests") || errorMsg.includes("TOO_MANY_ATTEMPTS")) {
       errorMsg = "You have requested too many verification codes. Please wait a few minutes and try again.";
    } else if (errorMsg.includes("auth/invalid-verification-code") || errorMsg.includes("INVALID_CODE")) {
       errorMsg = "The verification code you entered is invalid. Please check the code and try again.";
    } else if (errorMsg.includes("auth/invalid-phone-number")) {
       errorMsg = "The phone number entered is invalid. Please check the format and try again.";
    } else if (errorMsg.includes("auth/") || errorMsg.includes("Firebase")) {
       errorMsg = "Unable to process your request at this time. Please ensure your number is correct or try again later.";
    }
    
    setModalError(errorMsg);
  };

  // If already verified, redirect
  useEffect(() => {
    if (session?.user && (session.user as any).phoneVerified) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    // Clear existing verifier to prevent element removed errors on re-mounts
    if (typeof window !== "undefined" && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = undefined;
    }

    if (typeof window !== "undefined") {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {},
          'expired-callback': () => {}
        });
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const requestOTP = async () => {
    let formattedPhone = phone.trim();
    
    // Auto-format for BD numbers if they forget the country code
    if (formattedPhone.startsWith("01") && formattedPhone.length === 11) {
      formattedPhone = "+88" + formattedPhone;
    } else if (formattedPhone.startsWith("8801") && formattedPhone.length === 13) {
      formattedPhone = "+" + formattedPhone;
    }

    if (!formattedPhone.startsWith("+")) {
      setModalError("Please enter a valid phone number with country code (e.g., +8801...)");
      return;
    }
    
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseIdToken: idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to verify phone");
      }

      // Update NextAuth session
      await update({ phoneVerified: true, phone });
      
      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Verify Your Phone Number
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please add and verify your phone number to continue.
          </p>
        </div>

        <div className="space-y-4">
          {!confirmationResult ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+8801xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div id="recaptcha-container"></div>
              <Button onClick={requestOTP} disabled={isLoading || !phone} className="w-full">
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button onClick={verifyOTP} disabled={isLoading || !otp} className="w-full">
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          )}
        </div>

        <AlertDialog open={!!modalError} onOpenChange={() => setModalError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Authentication Notice</AlertDialogTitle>
              <AlertDialogDescription>
                {modalError}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setModalError(null)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

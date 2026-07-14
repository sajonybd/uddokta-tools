"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export function PhoneOTPLogin() {
  const router = useRouter();
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
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-otp-btn', {
          'size': 'invisible',
          'callback': (response: any) => {},
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

      // Sign in with NextAuth using the Firebase ID token
      const signInResult = await signIn("credentials", {
        redirect: false,
        firebaseIdToken: idToken,
      });

      if (signInResult?.error) {
        if (signInResult.error === "DeviceLimitExceeded") {
            setModalError("Security Warning: Device limit reached. You can only be logged into one device at a time. Continuing to attempt multi-device access may result in your account being blocked. Please logout from your other device.");
        } else {
            handleError(new Error(signInResult.error));
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!confirmationResult ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button id="send-otp-btn" onClick={requestOTP} disabled={isLoading || !phone} className="w-full">
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
            {isLoading ? "Verifying..." : "Verify OTP & Login"}
          </Button>
        </>
      )}

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
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

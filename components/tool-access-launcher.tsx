"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ToolAccessLauncherProps {
  toolId: string;
  toolName: string;
  loginMethod?: string;
}

type AccessResponse = {
  targetUrl: string;
  loginMethod: "none" | "cookies" | "localstorage" | "indexeddb" | "cloud";
  loginData: any;
};

// Official Chrome Web Store Extension ID
const OFFICIAL_EXTENSION_ID = "naolbfdgjgfehcjeojagkoipnbokgjni";

declare global {
  interface Window {
    chrome?: {
      runtime: {
        sendMessage: (
          extensionId: string,
          message: any,
          options?: any,
          responseCallback?: (response: any) => void
        ) => void;
        lastError?: any;
      };
    };
  }
}

export function ToolAccessLauncher({ toolId, toolName, loginMethod }: ToolAccessLauncherProps) {
  const [loading, setLoading] = useState(false);

  const EXTENSION_READY_TIMEOUT_MS = 2500;
  const EXTENSION_RESULT_TIMEOUT_MS = 30000;
  const EXTENSION_ACK_TIMEOUT_MS = 1500;

  const getButtonText = () => {
    if (loading) return "Launching...";
    const nameLower = toolName.toLowerCase();
    if (nameLower.includes("chatgpt")) {
      return "Login to ChatGPT";
    }
    if (nameLower.includes("grok")) {
      return "Login to Grok";
    }
    if (loginMethod && loginMethod !== "none" && loginMethod !== "cloud") {
      return `Login to ${toolName}`;
    }
    return `Launch ${toolName}`;
  };

  async function waitForExtensionReady(timeoutMs: number) {
    const requestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    return await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => {
        window.removeEventListener("message", handler as EventListener);
        resolve(false);
      }, timeoutMs);

      const handler = (event: MessageEvent) => {
        if (event.source !== window) return;
        const data = event.data;
        if (!data) return;

        if (
          (data.type === "SEO_TOOL_EXTENSION_READY" || data.type === "UDDOKTABD_EXTENSION_READY") &&
          (!data.requestId || data.requestId === requestId)
        ) {
          window.clearTimeout(timeout);
          window.removeEventListener("message", handler as EventListener);
          resolve(true);
        }
      };

      window.addEventListener("message", handler as EventListener);
      window.postMessage({ type: "SEO_TOOL_EXTENSION_PING", requestId }, "*");
      window.postMessage({ type: "UDDOKTABD_EXTENSION_PING", requestId }, "*");
    });
  }

  async function checkExtensionInstalled(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    return new Promise((resolve) => {
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        try {
          window.chrome.runtime.sendMessage(
            OFFICIAL_EXTENSION_ID,
            { type: "PING" },
            (response) => {
              if (window.chrome.runtime.lastError) {
                // Fallback to postMessage check since the user's extension might not be updated to the new store version yet
                waitForExtensionReady(EXTENSION_READY_TIMEOUT_MS).then(resolve);
              } else if (response && response.type === "PONG") {
                resolve(true);
              } else {
                waitForExtensionReady(EXTENSION_READY_TIMEOUT_MS).then(resolve);
              }
            }
          );
          return;
        } catch (e) {
          // fall through
        }
      }

      waitForExtensionReady(EXTENSION_READY_TIMEOUT_MS).then(resolve);
    });
  }

  async function handleLaunch() {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/tools/${toolId}/access`, { cache: "no-store" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to access tool");
      }

      const access = payload as AccessResponse;
      if (!access.targetUrl) {
        throw new Error("Tool target URL is not configured.");
      }

      if (!access.loginMethod || access.loginMethod === "none" || access.loginMethod === "cloud") {
        window.open(access.targetUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const ready = await checkExtensionInstalled();
      if (!ready) {
        toast.error("Extension Verification Failed", {
          description: "Please download and install the official UddoktaBD Premium Tools extension to access this tool.",
          action: {
            label: "Download",
            onClick: () => window.open("/download/extension", "_blank"),
          },
        });
        return;
      }

      const requestId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const extensionResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        let acked = false;

        const timeout = window.setTimeout(() => {
          window.removeEventListener("message", handler as EventListener);
          resolve({ ok: false, error: "No response from extension background worker (timed out)." });
        }, EXTENSION_RESULT_TIMEOUT_MS);

        const ackTimeout = window.setTimeout(() => {
          if (!acked) {
            window.clearTimeout(timeout);
            window.removeEventListener("message", handler as EventListener);
            resolve({
              ok: false,
              error:
                "Extension content script did not ACK. Check extension site access for this dashboard domain and reload the page.",
            });
          }
        }, EXTENSION_ACK_TIMEOUT_MS);

        const handler = (event: MessageEvent) => {
          if (event.source !== window) return;
          const data = event.data;

          if (
            (data?.type === "SEO_TOOL_ACCESS_ACK" || data?.type === "UDDOKTABD_ACCESS_ACK") &&
            data.requestId === requestId
          ) {
            acked = true;
            window.clearTimeout(ackTimeout);
            return;
          }

          if (
            !data ||
            (data.type !== "SEO_TOOL_ACCESS_RESULT" && data.type !== "UDDOKTABD_ACCESS_RESULT") ||
            data.requestId !== requestId
          )
            return;
          window.clearTimeout(timeout);
          window.clearTimeout(ackTimeout);
          window.removeEventListener("message", handler as EventListener);
          resolve({ ok: !!data.ok, error: data.error });
        };

        window.addEventListener("message", handler as EventListener);
        window.postMessage(
          {
            type: "SEO_TOOL_ACCESS_REQUEST",
            requestId,
            payload: access,
          },
          "*"
        );
        window.postMessage(
          {
            type: "UDDOKTABD_ACCESS_REQUEST",
            requestId,
            payload: access,
          },
          "*"
        );
      });

      if (!extensionResult.ok) {
        toast.error("Launch Failed", {
          description: extensionResult.error || "Failed to apply login data. Please try again.",
          action: {
            label: "Download Extension",
            onClick: () => window.open("/download/extension", "_blank"),
          },
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to launch tool");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full h-12 text-lg text-white font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 rounded-xl flex items-center justify-center gap-2"
        disabled={loading}
        onClick={handleLaunch}
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Launching...
          </>
        ) : (
          getButtonText()
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonitorSmartphone, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManageDevicesModalProps {
  userId: string;
  initialMaxDevices: number;
  onUpdate: () => void;
}

interface Session {
  _id: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export function ManageDevicesModal({ userId, initialMaxDevices, onUpdate }: ManageDevicesModalProps) {
  const [open, setOpen] = useState(false);
  const [maxDevices, setMaxDevices] = useState(initialMaxDevices || 1);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMaxDevices(initialMaxDevices || 1);
      fetchSessions();
    }
  }, [open, initialMaxDevices]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSaveMaxDevices = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxDevices }),
      });
      if (res.ok) {
        toast.success("Device limit updated successfully");
        onUpdate();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update device limit");
    } finally {
      setSaving(false);
    }
  };

  const handleForceLogout = async (sessionId?: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        toast.success(sessionId ? "Session terminated" : "All sessions terminated");
        fetchSessions();
      } else {
        throw new Error("Failed to terminate session");
      }
    } catch (err) {
      toast.error("Failed to terminate session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MonitorSmartphone className="h-4 w-4" />
          Devices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Device Access</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="maxDevices">Max Allowed Devices</Label>
              <Input 
                id="maxDevices" 
                type="number" 
                min="1" 
                value={maxDevices} 
                onChange={(e) => setMaxDevices(parseInt(e.target.value) || 1)} 
              />
            </div>
            <Button onClick={handleSaveMaxDevices} disabled={saving || maxDevices === initialMaxDevices}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Active Sessions ({sessions.length})</h4>
              {sessions.length > 0 && (
                <Button variant="destructive" size="sm" onClick={() => handleForceLogout()}>
                  Logout All
                </Button>
              )}
            </div>

            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
              {loadingSessions ? (
                <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No active sessions found.
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session._id} className="p-3 flex items-center justify-between gap-4">
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-medium truncate">{session.userAgent || "Unknown Device"}</p>
                      <p className="text-xs text-muted-foreground">IP: {session.ip || "Unknown"} • Started: {new Date(session.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleForceLogout(session.sessionId)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

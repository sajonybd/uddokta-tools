"use client";

import React, { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, MonitorSmartphone, Clock, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IPData {
  ip: string;
  userAgent: string;
  lastActive: string;
  sessionCount: number;
}

interface SuspiciousData {
  userId: string;
  ipCount: number;
  sessionCount: number;
  lastActive: string;
  ips: IPData[];
  user?: {
    name: string;
    email: string;
  };
}

export function SuspiciousActivityTable({ data }: { data: SuspiciousData[] }) {
  const [selectedUser, setSelectedUser] = useState<SuspiciousData | null>(null);
  const [geoData, setGeoData] = useState<Record<string, { city: string, country: string, isFetching: boolean, error?: string }>>({});

  const openModal = async (row: SuspiciousData) => {
    setSelectedUser(row);

    // Fetch IP geo data for any IPs we haven't fetched yet
    row.ips.forEach(async (ipData) => {
      const { ip } = ipData;
      if (!geoData[ip]) {
        setGeoData(prev => ({ ...prev, [ip]: { ...prev[ip], isFetching: true } }));
        try {
          const res = await fetch(`/api/admin/ip-location?ip=${ip}`);
          const json = await res.json();
          if (json.status === "success") {
            setGeoData(prev => ({
              ...prev,
              [ip]: { city: json.city, country: json.country, isFetching: false }
            }));
          } else {
            setGeoData(prev => ({
              ...prev,
              [ip]: { city: "Unknown", country: "Unknown", isFetching: false, error: json.message }
            }));
          }
        } catch (e) {
          setGeoData(prev => ({
            ...prev,
            [ip]: { city: "Unknown", country: "Unknown", isFetching: false, error: "Failed to fetch" }
          }));
        }
      }
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Unique IPs</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No suspicious activity detected.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow 
                  key={row.userId.toString()}
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => openModal(row)}
                >
                  <TableCell>
                    <div className="font-medium">{row.user?.name}</div>
                    <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{row.ipCount} IPs</Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {row.sessionCount} total sessions
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(row.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <ExternalLink size={16} className="text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suspicious Login Activity Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.user?.name} ({selectedUser?.user?.email}) has logged in from {selectedUser?.ipCount} different IP addresses.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-3 p-1">
              {selectedUser?.ips.map((ipData, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 border rounded-lg bg-background">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{ipData.ip}</Badge>
                      {geoData[ipData.ip] ? (
                        geoData[ipData.ip].isFetching ? (
                          <span className="text-xs text-muted-foreground">Locating...</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            {geoData[ipData.ip].city}, {geoData[ipData.ip].country}
                          </div>
                        )
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      Last active: {new Date(ipData.lastActive).toLocaleString()}
                      <span className="ml-2">({ipData.sessionCount} sessions)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md mt-1">
                    <MonitorSmartphone size={14} className="mt-0.5 shrink-0" />
                    <span className="break-all leading-relaxed">{ipData.userAgent || "Unknown Device"}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

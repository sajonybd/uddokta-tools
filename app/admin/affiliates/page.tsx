"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, DollarSign, Wallet, Users, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function AdminAffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<any>({ withdrawals: [], earnings: [] });
  
  // Dialog State
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/affiliate");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast({ title: "Failed to load affiliate details", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!activeRequest) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/admin/affiliate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: activeRequest._id,
          status,
          adminNote,
        }),
      });

      if (res.ok) {
        toast({ title: `Request ${status} successfully!` });
        setActiveRequest(null);
        setAdminNote("");
        fetchData();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to update status", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Calculate stats
  const pendingRequests = data.withdrawals.filter((w: any) => w.status === "pending");
  const approvedRequests = data.withdrawals.filter((w: any) => w.status === "approved");
  const totalPayoutAmt = approvedRequests.reduce((sum: number, w: any) => sum + w.amount, 0);
  const uniqueAffiliatesCount = new Set(data.earnings.map((e: any) => e.referrer?._id?.toString())).size;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Management</h2>
        <p className="text-muted-foreground">Approve withdrawal requests and view system-wide affiliate commission allocations.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingRequests.length} Requests</div>
            <p className="text-xs text-muted-foreground">Needs manual payout processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalPayoutAmt.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Successfully paid withdrawals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueAffiliatesCount} Affiliates</div>
            <p className="text-xs text-muted-foreground">Registered referral partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="withdrawals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="withdrawals">Withdrawals ({pendingRequests.length} pending)</TabsTrigger>
          <TabsTrigger value="earnings">Commission Log</TabsTrigger>
        </TabsList>

        {/* Withdrawals List Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Payout Requests</CardTitle>
              <CardDescription>Verify user maturity balance, send money via bank/bKash/Rocket/Nagad, then approve the request.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.withdrawals.length > 0 ? (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Requested Date</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Amount</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Payment details</th>
                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.withdrawals.map((wd: any) => (
                        <tr key={wd._id} className="border-b hover:bg-muted/50">
                          <td className="p-2 align-middle">{format(new Date(wd.createdAt), "dd MMM yyyy HH:mm")}</td>
                          <td className="p-2 align-middle font-medium">
                            <div>{wd.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{wd.user?.email} (UID #{wd.user?.customId})</div>
                          </td>
                          <td className="p-2 align-middle text-right font-bold text-base">${wd.amount}</td>
                          <td className="p-2 align-middle font-mono text-xs">
                            <span className="uppercase font-bold text-xs bg-muted px-1.5 py-0.5 rounded border mr-1">{wd.paymentMethod}</span>
                            {wd.paymentDetails}
                            {wd.adminNote && (
                              <div className="text-muted-foreground font-sans mt-1 text-[11px]">
                                <strong>Admin Note:</strong> {wd.adminNote}
                              </div>
                            )}
                          </td>
                          <td className="p-2 align-middle text-center">
                            {wd.status === "approved" && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">Approved</span>
                            )}
                            {wd.status === "rejected" && (
                              <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:text-rose-200">Rejected</span>
                            )}
                            {wd.status === "pending" && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">Pending</span>
                            )}
                          </td>
                          <td className="p-2 align-middle text-right">
                            {wd.status === "pending" ? (
                              <Button size="sm" onClick={() => setActiveRequest(wd)}>
                                Process
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">No withdrawal requests found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Log Tab */}
        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>System Affiliate Commissions</CardTitle>
              <CardDescription>Allocated rewards history on referrals.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.earnings.length > 0 ? (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Allocation Date</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Referrer</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Purchaser</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Type</th>
                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Purchase</th>
                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Commission</th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Mature Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.earnings.map((e: any) => {
                        const mature = new Date(e.availableAt) <= new Date();
                        return (
                          <tr key={e._id} className="border-b hover:bg-muted/50">
                            <td className="p-2 align-middle">{format(new Date(e.createdAt), "dd MMM yyyy")}</td>
                            <td className="p-2 align-middle">
                              <div className="font-semibold">{e.referrer?.name || "Deleted"}</div>
                              <div className="text-xs text-muted-foreground">UID #{e.referrer?.customId || "..."}</div>
                            </td>
                            <td className="p-2 align-middle">
                              <div>{e.referredUser?.name || "Deleted"}</div>
                              <div className="text-xs text-muted-foreground">UID #{e.referredUser?.customId || "..."}</div>
                            </td>
                            <td className="p-2 align-middle capitalize text-xs">{e.type?.replace("_", " ")}</td>
                            <td className="p-2 align-middle text-right font-medium">${e.purchaseAmount}</td>
                            <td className="p-2 align-middle text-right font-bold text-emerald-600 dark:text-emerald-400">${e.amount} <span className="text-[10px] text-muted-foreground">({e.commissionPercentage}%)</span></td>
                            <td className="p-2 align-middle font-mono text-xs">
                              {format(new Date(e.availableAt), "dd MMM yyyy")}
                              {mature ? (
                                <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 px-1 rounded">Mature</span>
                              ) : (
                                <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 px-1 rounded">Hold</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">No earnings registered in system yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Request Modal */}
      <Dialog open={!!activeRequest} onOpenChange={() => setActiveRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Submit payout approval or rejection. Make sure to complete the transaction to the user's wallet/bank beforehand.
            </DialogDescription>
          </DialogHeader>

          {activeRequest && (
            <div className="space-y-4 py-3">
              <div className="rounded bg-muted p-3 text-sm space-y-1">
                <div><strong>User:</strong> {activeRequest.user?.name} (UID #{activeRequest.user?.customId})</div>
                <div><strong>Request Amount:</strong> <span className="font-bold text-base text-primary">${activeRequest.amount}</span></div>
                <div><strong>Payout Option:</strong> <span className="uppercase font-bold font-mono text-xs">{activeRequest.paymentMethod}</span></div>
                <div><strong>Target Account details:</strong> <span className="font-mono text-xs bg-background px-1 border rounded block mt-1 py-0.5 select-all">{activeRequest.paymentDetails}</span></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Transaction Proof / Admin Note</Label>
                <Input
                  id="adminNote"
                  placeholder="Enter TxnID / bank reference ID or rejection reason"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={processing}
              onClick={() => handleUpdateStatus("rejected")}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Request
            </Button>
            <Button
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={processing}
              onClick={() => handleUpdateStatus("approved")}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

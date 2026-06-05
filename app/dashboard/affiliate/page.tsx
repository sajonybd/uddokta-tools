"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Check, Gift, Wallet, Clock, ArrowUpRight, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

export default function UserAffiliatePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Withdrawal Form State
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [paymentDetails, setPaymentDetails] = useState("");

  const fetchAffiliateData = async () => {
    try {
      const res = await fetch("/api/user/affiliate");
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
    fetchAffiliateData();
  }, []);

  const handleCopyLink = () => {
    if (!session?.user) return;
    const customId = (session.user as any).customId;
    const refLink = `${window.location.origin}/?ref=${customId}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast({ title: "Referral link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmount = parseFloat(amount);
    if (isNaN(reqAmount) || reqAmount <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (reqAmount > (data?.metrics?.availableToWithdraw || 0)) {
      toast({ title: "Insufficient available balance", variant: "destructive" });
      return;
    }

    if (!paymentDetails.trim()) {
      toast({ title: "Please enter payment account/details", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: reqAmount,
          paymentMethod,
          paymentDetails,
        }),
      });

      if (res.ok) {
        toast({ title: "Withdrawal request submitted successfully!" });
        setAmount("");
        setPaymentDetails("");
        fetchAffiliateData();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Submission failed", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const customId = (session?.user as any)?.customId;
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${customId || "..."}` : "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Affiliate Program</h2>
        <p className="text-muted-foreground">Refer new users to our digital tools and earn lifetime recurring commissions.</p>
      </div>

      {/* Referral Link & Code Card */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Your Referral Link
          </CardTitle>
          <CardDescription>Share this link. Cookies track visitors for 90 days.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-center">
          <Input 
            readOnly 
            value={referralUrl} 
            className="font-mono bg-background border border-border"
          />
          <Button onClick={handleCopyLink} className="w-full sm:w-auto shrink-0 flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </CardContent>
      </Card>

      {/* Balance Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.metrics?.totalEarned || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime commission earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${data?.metrics?.availableToWithdraw || 0}</div>
            <p className="text-xs text-muted-foreground">Mature & ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">${data?.metrics?.pendingBalance || 0}</div>
            <p className="text-xs text-muted-foreground">Locked under 30 days hold period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.metrics?.totalWithdrawn || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully sent to your accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Request Withdrawal Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Payouts are processed manually by administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Max: ${data?.metrics?.availableToWithdraw || 0}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash (Personal)</SelectItem>
                    <SelectItem value="nagad">Nagad (Personal)</SelectItem>
                    <SelectItem value="rocket">Rocket (Personal)</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Payment Details</Label>
                <Input
                  id="details"
                  placeholder="Enter phone number / Bank details"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting || (data?.metrics?.availableToWithdraw || 0) <= 0}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Tables tabbed */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="earnings">Earnings Log</TabsTrigger>
              <TabsTrigger value="payouts">Payout History</TabsTrigger>
              <TabsTrigger value="signups">Referred Signups ({data?.referredUsers?.length || 0})</TabsTrigger>
            </TabsList>

            {/* Earnings Log tab */}
            <TabsContent value="earnings">
              <Card>
                <CardHeader>
                  <CardTitle>Affiliate Earnings History</CardTitle>
                  <CardDescription>Commissions are credited when referred users make approved purchases.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {data?.earningsLog && data.earningsLog.length > 0 ? (
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Referee</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Reward</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Availability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.earningsLog.map((earning: any) => {
                            const mature = new Date(earning.availableAt) <= new Date();
                            return (
                              <tr key={earning._id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-2 align-middle">{format(new Date(earning.createdAt), "dd MMM yyyy")}</td>
                                <td className="p-2 align-middle font-medium">User #{earning.referredUser?.customId || "..."}</td>
                                <td className="p-2 align-middle capitalize">{earning.type?.replace("_", " ")}</td>
                                <td className="p-2 align-middle text-right font-bold text-emerald-600 dark:text-emerald-400">${earning.amount}</td>
                                <td className="p-2 align-middle">
                                  {mature ? (
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">Mature</span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">Pending</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No earnings registered yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payout History Tab */}
            <TabsContent value="payouts">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal History</CardTitle>
                  <CardDescription>Status logs of your payout requests.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {data?.withdrawalLog && data.withdrawalLog.length > 0 ? (
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Details</th>
                            <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Amount</th>
                            <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.withdrawalLog.map((wd: any) => (
                            <tr key={wd._id} className="border-b hover:bg-muted/50">
                              <td className="p-2 align-middle">{format(new Date(wd.createdAt), "dd MMM yyyy")}</td>
                              <td className="p-2 align-middle font-mono text-xs">
                                <span className="uppercase font-bold">{wd.paymentMethod}</span>: {wd.paymentDetails}
                                {wd.adminNote && (
                                  <div className="text-muted-foreground mt-1 font-sans">
                                    <strong>Admin Note:</strong> {wd.adminNote}
                                  </div>
                                )}
                              </td>
                              <td className="p-2 align-middle text-right font-semibold">${wd.amount}</td>
                              <td className="p-2 align-middle text-center">
                                {wd.status === "approved" && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">Approved</span>
                                )}
                                {wd.status === "rejected" && (
                                  <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:text-rose-200">Rejected</span>
                                )}
                                {wd.status === "pending" && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200 font-mono">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No withdrawals requested yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referred Signups Tab */}
            <TabsContent value="signups">
              <Card>
                <CardHeader>
                  <CardTitle>Referred Signups</CardTitle>
                  <CardDescription>Users who created accounts using your referral link.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {data?.referredUsers && data.referredUsers.length > 0 ? (
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Register Date</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">User ID</th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.referredUsers.map((refUser: any) => (
                            <tr key={refUser._id} className="border-b hover:bg-muted/50">
                              <td className="p-2 align-middle">{format(new Date(refUser.createdAt), "dd MMM yyyy")}</td>
                              <td className="p-2 align-middle font-mono font-semibold text-xs">User #{refUser.customId || "..."}</td>
                              <td className="p-2 align-middle font-medium">{refUser.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No referred signups recorded yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

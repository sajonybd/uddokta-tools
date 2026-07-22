import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Clock, Activity, ShieldAlert, MonitorSmartphone } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import DeviceSession from "@/models/DeviceSession";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SuspiciousActivityTable } from "@/components/admin/suspicious-activity-table";

// Force dynamic rendering to get fresh stats
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await dbConnect();

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    activeSubsCount,
    expiringSubsCount,
    activeSessionsCount,
    recentLogins,
    suspiciousSessions
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'active', endDate: { $lte: nextWeek } }),
    DeviceSession.countDocuments(),
    DeviceSession.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email customId').lean(),
    DeviceSession.aggregate([
      {
        $group: {
          _id: { userId: "$userId", ip: "$ip" },
          userAgent: { $last: "$userAgent" },
          lastActive: { $max: "$lastActive" },
          sessionCountForIp: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.userId",
          ipCount: { $sum: 1 },
          sessionCount: { $sum: "$sessionCountForIp" },
          lastActive: { $max: "$lastActive" },
          ips: {
            $push: {
              ip: "$_id.ip",
              userAgent: "$userAgent",
              lastActive: "$lastActive",
              sessionCount: "$sessionCountForIp"
            }
          }
        }
      },
      {
        $project: {
          userId: "$_id",
          ipCount: 1,
          sessionCount: 1,
          lastActive: 1,
          ips: 1
        }
      },
      {
        $match: {
          ipCount: { $gt: 1 }
        }
      },
      {
        $sort: { ipCount: -1 }
      },
      {
        $limit: 10
      }
    ])
  ]);

  // Map suspicious users
  const suspiciousUserIds = suspiciousSessions.map(s => s.userId);
  const suspiciousUserDetails = await User.find({ _id: { $in: suspiciousUserIds } }).select('name email customId').lean();
  
  const suspiciousData = suspiciousSessions.map(s => {
    const user = suspiciousUserDetails.find(u => u._id.toString() === s.userId.toString());
    return {
      userId: s.userId.toString(),
      ipCount: s.ipCount,
      sessionCount: s.sessionCount,
      lastActive: s.lastActive instanceof Date ? s.lastActive.toISOString() : s.lastActive,
      ips: s.ips.map((ipData: any) => ({
        ip: ipData.ip,
        userAgent: ipData.userAgent,
        lastActive: ipData.lastActive instanceof Date ? ipData.lastActive.toISOString() : ipData.lastActive,
        sessionCount: ipData.sessionCount
      })),
      user: user ? {
        name: user.name,
        email: user.email,
      } : undefined
    };
  }).filter(s => s.user);

  return (
    <div className="flex-1 space-y-8 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubsCount}</div>
            <p className="text-xs text-muted-foreground">Users with active plans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon (7d)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSubsCount}</div>
            <p className="text-xs text-muted-foreground">Requires renewal soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessionsCount}</div>
            <p className="text-xs text-muted-foreground">Total login sessions active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Login Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No recent logins found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLogins.map((session: any) => (
                      <TableRow key={session._id.toString()}>
                        <TableCell>
                          <div className="font-medium">{session.userId?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{session.userId?.email || 'No email'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{session.ip || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={session.userAgent}>
                            {session.userAgent || 'Unknown Device'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(session.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Suspicious Activity (IP Hopping)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SuspiciousActivityTable data={suspiciousData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

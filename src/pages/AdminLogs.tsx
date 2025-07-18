import { Activity, AlertTriangle, Info, CheckCircle, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AdminLogs = () => {
  const logs = [
    {
      id: 1,
      timestamp: "2025-07-18 11:45:23",
      level: "info",
      action: "User Login",
      user: "john.doe@example.com",
      details: "Successful authentication",
      ip: "192.168.1.100"
    },
    {
      id: 2,
      timestamp: "2025-07-18 11:44:15",
      level: "warning",
      action: "Failed Login Attempt",
      user: "unknown@example.com",
      details: "Invalid credentials",
      ip: "192.168.1.200"
    },
    {
      id: 3,
      timestamp: "2025-07-18 11:43:02",
      level: "success",
      action: "Appointment Scheduled",
      user: "sarah.wilson@example.com",
      details: "Appointment with Dr. Johnson",
      ip: "192.168.1.150"
    },
    {
      id: 4,
      timestamp: "2025-07-18 11:40:30",
      level: "error",
      action: "Database Connection Failed",
      user: "system",
      details: "Connection timeout after 30 seconds",
      ip: "localhost"
    },
    {
      id: 5,
      timestamp: "2025-07-18 11:39:45",
      level: "info",
      action: "Health Record Updated",
      user: "emma.brown@example.com",
      details: "Lab results uploaded",
      ip: "192.168.1.175"
    }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system activity and troubleshoot issues
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">-12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">423</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Real-time system events and user actions</CardDescription>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-8" />
            </div>
            <Button variant="outline">Filter by Level</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getLogIcon(log.level)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{log.action}</p>
                      <Badge variant={getLogBadgeVariant(log.level)}>
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>User: {log.user}</span>
                      <span>IP: {log.ip}</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
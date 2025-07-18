import { Users, Calendar, FileText, Settings, Stethoscope, Heart, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{greeting}, nandini!</h1>
          <p className="text-white/90 mb-6">Your health journey continues. Let's make today a healthy day!</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Health Score:</span>
              <Badge variant="secondary" className="bg-white/20 text-white">85/100</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Streak:</span>
              <Badge variant="secondary" className="bg-white/20 text-white">7 days</Badge>
            </div>
          </div>
        </div>
        
        {/* Heart Icon */}
        <div className="absolute right-8 top-8 opacity-20">
          <Heart className="w-20 h-20" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-health-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI Symptom Checker</h3>
              <p className="text-sm text-muted-foreground mb-4">Describe your symptoms to get AI-powered insights</p>
              <Button size="sm" className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-health-purple rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Mental Health Check</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our AI therapist for mental wellness</p>
              <Button size="sm" className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-health-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Book Appointment</h3>
              <p className="text-sm text-muted-foreground mb-4">Schedule a consultation with a doctor</p>
              <Button size="sm" className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-health-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">View Records</h3>
              <p className="text-sm text-muted-foreground mb-4">Access your medical history and reports</p>
              <Button size="sm" className="w-full">Get Started</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value="1,247"
            change="+12%"
            changeType="positive"
            icon={Users}
            gradient="bg-health-blue"
          />
          <StatCard
            title="Daily Active"
            value="423"
            change="+8%"
            changeType="positive"
            icon={TrendingUp}
            gradient="bg-health-green"
          />
          <StatCard
            title="Appointments"
            value="89"
            change="+15%"
            changeType="positive"
            icon={Calendar}
            gradient="bg-health-purple"
          />
          <StatCard
            title="System Health"
            value="99.9%"
            change="+0.1%"
            changeType="positive"
            icon={Settings}
            gradient="bg-health-orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-health-blue rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New patient registration</p>
                  <p className="text-xs text-muted-foreground">Sarah Wilson - 30 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-health-green rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Consultation completed</p>
                  <p className="text-xs text-muted-foreground">John Smith - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-health-orange rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab results reviewed</p>
                  <p className="text-xs text-muted-foreground">Mary Johnson - 2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 bg-health-orange rounded-full animate-pulse"></span>
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Storage Warning</p>
                <p className="text-xs text-yellow-600">Database storage is at 85% capacity</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Backup Complete</p>
                <p className="text-xs text-green-600">Daily backup completed successfully</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
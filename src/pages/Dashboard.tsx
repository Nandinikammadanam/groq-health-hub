import { useState } from "react";
import { Users, Calendar, FileText, Settings, Stethoscope, Heart, TrendingUp, Clock, Video, UserCheck, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  userRole?: 'patient' | 'doctor' | 'admin';
}

// Empty appointments for initial state
const upcomingAppointments: any[] = [];

export default function Dashboard({ userRole = 'patient' }: DashboardProps) {
  const [personalMetrics] = useState({
    patientsThisMonth: 0,
    consultationsToday: 0,
    avgRating: 0
  });
  
  const navigate = useNavigate();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {userRole === 'doctor' ? 'Dr. ' : ''}nandini!
          </h1>
          <p className="text-white/90 mb-6">
            {userRole === 'doctor' 
              ? `You have ${upcomingAppointments.length} appointments today. Ready to help your patients!`
              : 'Your health journey continues. Let\'s make today a healthy day!'
            }
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {userRole === 'doctor' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Patients This Month:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">{personalMetrics.patientsThisMonth}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Rating:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">★ {personalMetrics.avgRating}</Badge>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Health Score:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">0/100</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Streak:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">0 days</Badge>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Dynamic Icon */}
        <div className="absolute right-8 top-8 opacity-20">
          {userRole === 'doctor' ? <Stethoscope className="w-20 h-20" /> : <Heart className="w-20 h-20" />}
        </div>
      </div>


      {/* Quick Actions - Only for Patients */}
      {userRole === 'patient' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/symptom-checker')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-health-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">AI Symptom Checker</h3>
                <p className="text-sm text-muted-foreground mb-4">Describe your symptoms to get AI-powered insights</p>
                <Button size="sm" className="w-full" onClick={() => navigate('/symptom-checker')}>Get Started</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/mental-health')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-health-purple rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Mental Health Check</h3>
                <p className="text-sm text-muted-foreground mb-4">Chat with our AI therapist for mental wellness</p>
                <Button size="sm" className="w-full" onClick={() => navigate('/mental-health')}>Get Started</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/appointments')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-health-green rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Book Appointment</h3>
                <p className="text-sm text-muted-foreground mb-4">Schedule a consultation with a doctor</p>
                <Button size="sm" className="w-full" onClick={() => navigate('/appointments')}>Get Started</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/records')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-health-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">View Records</h3>
                <p className="text-sm text-muted-foreground mb-4">Access your medical history and reports</p>
                <Button size="sm" className="w-full" onClick={() => navigate('/records')}>Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Health Overview / Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          {userRole === 'doctor' ? 'Practice Overview' : userRole === 'admin' ? 'System Overview' : 'Health Overview'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userRole === 'doctor' ? (
            <>
              <StatCard
                title="Patients This Month"
                value={personalMetrics.patientsThisMonth.toString()}
                change="0%"
                changeType="neutral"
                icon={Users}
                gradient="bg-health-blue"
              />
              <StatCard
                title="Today's Appointments"
                value={personalMetrics.consultationsToday.toString()}
                change="0"
                changeType="neutral"
                icon={Calendar}
                gradient="bg-health-green"
              />
              <StatCard
                title="Patient Rating"
                value={`${personalMetrics.avgRating}/5`}
                change="0"
                changeType="neutral"
                icon={Heart}
                gradient="bg-health-purple"
              />
              <StatCard
                title="Completion Rate"
                value="0%"
                change="0%"
                changeType="neutral"
                icon={TrendingUp}
                gradient="bg-health-orange"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Users"
                value="0"
                change="0%"
                changeType="neutral"
                icon={Users}
                gradient="bg-health-blue"
              />
              <StatCard
                title="Daily Active"
                value="0"
                change="0%"
                changeType="neutral"
                icon={TrendingUp}
                gradient="bg-health-green"
              />
              <StatCard
                title="Appointments"
                value="0"
                change="0%"
                changeType="neutral"
                icon={Calendar}
                gradient="bg-health-purple"
              />
              <StatCard
                title="System Health"
                value="100%"
                change="0%"
                changeType="neutral"
                icon={Settings}
                gradient="bg-health-orange"
              />
            </>
          )}
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
              <div className="text-center py-8 text-muted-foreground">
                No recent activity to display.
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
              <div className="text-center py-8 text-muted-foreground">
                No system alerts at this time.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
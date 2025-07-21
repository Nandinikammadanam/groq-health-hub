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

// Mock data for upcoming appointments
const upcomingAppointments = [
  { id: 1, patient: "John Doe", time: "10:00 AM", type: "Consultation" },
  { id: 2, patient: "Sarah Wilson", time: "11:30 AM", type: "Follow-up" },
  { id: 3, patient: "Mike Johnson", time: "2:00 PM", type: "Check-up" }
];

export default function Dashboard({ userRole = 'patient' }: DashboardProps) {
  const [personalMetrics] = useState({
    patientsThisMonth: 47,
    consultationsToday: 6,
    avgRating: 4.8
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
                  <Badge variant="secondary" className="bg-white/20 text-white">85/100</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Streak:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">7 days</Badge>
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

      {/* Doctor Quick Actions */}
      {userRole === 'doctor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Appointments</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/schedule')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.time} • {apt.type}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start h-12" onClick={() => navigate('/doctor/schedule')}>
                  <Calendar className="w-4 h-4 mr-3" />
                  Go to Schedule
                </Button>
                <Button variant="outline" className="justify-start h-12" onClick={() => navigate('/doctor/patients')}>
                  <UserCheck className="w-4 h-4 mr-3" />
                  Review Patient Records
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Video className="w-4 h-4 mr-3" />
                  Start Emergency Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions - Only for Patients */}
      {userRole === 'patient' && (
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
                change="+12%"
                changeType="positive"
                icon={Users}
                gradient="bg-health-blue"
              />
              <StatCard
                title="Today's Appointments"
                value={personalMetrics.consultationsToday.toString()}
                change="+3"
                changeType="positive"
                icon={Calendar}
                gradient="bg-health-green"
              />
              <StatCard
                title="Patient Rating"
                value={`${personalMetrics.avgRating}/5`}
                change="+0.2"
                changeType="positive"
                icon={Heart}
                gradient="bg-health-purple"
              />
              <StatCard
                title="Completion Rate"
                value="97%"
                change="+2%"
                changeType="positive"
                icon={TrendingUp}
                gradient="bg-health-orange"
              />
            </>
          ) : (
            <>
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
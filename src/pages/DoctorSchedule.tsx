import { Calendar, Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DoctorSchedule = () => {
  const timeSlots = [
    { time: "09:00 AM", patient: "John Doe", type: "Consultation", status: "confirmed" },
    { time: "10:00 AM", patient: "Available", type: "Open Slot", status: "available" },
    { time: "11:00 AM", patient: "Sarah Wilson", type: "Follow-up", status: "confirmed" },
    { time: "02:00 PM", patient: "Mike Johnson", type: "Consultation", status: "pending" },
    { time: "03:00 PM", patient: "Available", type: "Open Slot", status: "available" },
    { time: "04:00 PM", patient: "Emma Brown", type: "Consultation", status: "confirmed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage your appointments and availability
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Time Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">4 confirmed, 1 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Open for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Friday, July 18, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{slot.time}</span>
                  </div>
                  <div>
                    <p className="font-medium">{slot.patient}</p>
                    <p className="text-sm text-muted-foreground">{slot.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    slot.status === 'confirmed' ? 'default' :
                    slot.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {slot.status}
                  </Badge>
                  {slot.status !== 'available' && (
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSchedule;
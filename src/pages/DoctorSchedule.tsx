import { useState } from "react";
import { Calendar, Clock, Users, Plus, Video, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const DoctorSchedule = () => {
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, time: "09:00 AM", patient: "John Doe", type: "Consultation", status: "confirmed", meetingLink: "" },
    { id: 2, time: "10:00 AM", patient: "Available", type: "Open Slot", status: "available", meetingLink: "" },
    { id: 3, time: "11:00 AM", patient: "Sarah Wilson", type: "Follow-up", status: "confirmed", meetingLink: "" },
    { id: 4, time: "02:00 PM", patient: "Mike Johnson", type: "Consultation", status: "pending", meetingLink: "" },
    { id: 5, time: "03:00 PM", patient: "Available", type: "Open Slot", status: "available", meetingLink: "" },
    { id: 6, time: "04:00 PM", patient: "Emma Brown", type: "Consultation", status: "confirmed", meetingLink: "" },
  ]);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const { toast } = useToast();

  const addTimeSlot = () => {
    if (!newSlotTime) {
      toast({
        title: "Time Required",
        description: "Please enter a time for the new slot.",
        variant: "destructive",
      });
      return;
    }

    const newSlot = {
      id: Date.now(),
      time: newSlotTime,
      patient: "Available",
      type: "Open Slot",
      status: "available",
      meetingLink: ""
    };

    setTimeSlots([...timeSlots, newSlot]);
    setNewSlotTime("");
    setIsAddingSlot(false);
    
    toast({
      title: "Time Slot Added",
      description: "New time slot has been added to your schedule.",
    });
  };

  const updateSlotStatus = (slotId: number, newStatus: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, status: newStatus } : slot
    ));
    
    toast({
      title: "Status Updated",
      description: `Appointment status updated to ${newStatus}.`,
    });
  };

  const startConsultation = (slotId: number) => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingLink = `https://meet.google.com/${meetingId}`;
    
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, meetingLink, status: "in-progress" } : slot
    ));
    
    window.open(meetingLink, '_blank');
    
    toast({
      title: "Consultation Started",
      description: "Video call has been initiated with the patient.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage your appointments and availability
          </p>
        </div>
        <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Time Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addTimeSlot} className="flex-1">
                  Add Slot
                </Button>
                <Button variant="outline" onClick={() => setIsAddingSlot(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                    slot.status === 'pending' ? 'secondary' :
                    slot.status === 'in-progress' ? 'destructive' : 'outline'
                  }>
                    {slot.status}
                  </Badge>
                  {slot.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateSlotStatus(slot.id, 'confirmed')}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Confirm
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateSlotStatus(slot.id, 'cancelled')}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {slot.status === 'confirmed' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => startConsultation(slot.id)}
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Start Call
                    </Button>
                  )}
                  {slot.status !== 'available' && slot.status !== 'pending' && slot.status !== 'confirmed' && (
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
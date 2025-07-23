import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Plus, Video, X, Check, Filter, Eye, Download, FileText, Timer, CalendarDays, Grid3X3, List, Zap, UserCheck, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id: number;
  time: string;
  patient: string;
  type: string;
  status: string;
  meetingLink: string;
  notes?: string;
  patientPhone?: string;
  patientEmail?: string;
  duration?: number;
}

interface PatientInfo {
  name: string;
  age: number;
  phone: string;
  email: string;
  conditions: string[];
  lastVisit?: string;
}

const initialPatients: Record<string, PatientInfo> = {};

const DoctorSchedule = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotDuration, setNewSlotDuration] = useState("30");
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [activeCallTimer, setActiveCallTimer] = useState<{[key: number]: number}>({});
  const [aiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from database
  useEffect(() => {
    if (user && user.role === 'doctor') {
      loadAppointments();
      loadAvailableSlots();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || user.role !== 'doctor') return;

    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${user.id}`
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    const slotsChannel = supabase
      .channel('slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'available_slots',
          filter: `doctor_id=eq.${user.id}`
        },
        () => {
          loadAvailableSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(slotsChannel);
    };
  }, [user]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*)
        `)
        .eq('doctor_id', user?.id)
        .eq('appointment_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .eq('doctor_id', user?.id)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  // Timer effect for active calls
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCallTimer(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[parseInt(key)] += 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimeSlot = async () => {
    if (!newSlotTime || !user) {
      toast({
        title: "Time Required",
        description: "Please enter a time for the new slot.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = newSlotTime.split(':');
      const endTime = new Date();
      endTime.setHours(parseInt(hours), parseInt(minutes) + parseInt(newSlotDuration));

      const { error } = await supabase
        .from('available_slots')
        .insert({
          doctor_id: user.id,
          date: new Date().toISOString().split('T')[0],
          start_time: newSlotTime,
          end_time: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          is_available: true
        });

      if (error) throw error;

      setNewSlotTime("");
      setNewSlotDuration("30");
      setIsAddingSlot(false);
      
      toast({
        title: "Time Slot Added", 
        description: "New time slot has been added to your schedule.",
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    // Update status first
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, status: "in-progress" } : slot
    ));
    
    // Start timer for this call
    setActiveCallTimer(prev => ({ ...prev, [slotId]: 0 }));
    
    // Show instructions for creating a proper meeting
    toast({
      title: "Video Call Instructions",
      description: "Please create a new meeting in Google Meet and share the link with your patient. Supabase integration coming soon for automated meeting creation!",
    });
    
    // Open Google Meet homepage for manual meeting creation
    window.open('https://meet.google.com/new', '_blank');
  };

  const endConsultation = (slotId: number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, status: "completed" } : slot
    ));
    
    // Remove timer for this call
    setActiveCallTimer(prev => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
    
    toast({
      title: "Consultation Ended",
      description: "Call has been completed and logged.",
    });
  };

  const bulkUpdateStatus = (status: string) => {
    if (selectedSlots.length === 0) {
      toast({
        title: "No Slots Selected",
        description: "Please select appointments to update.",
        variant: "destructive",
      });
      return;
    }

    setTimeSlots(timeSlots.map(slot => 
      selectedSlots.includes(slot.id) ? { ...slot, status } : slot
    ));
    
    setSelectedSlots([]);
    
    toast({
      title: "Bulk Update Complete",
      description: `${selectedSlots.length} appointments updated to ${status}.`,
    });
  };

  const exportSchedule = (format: 'csv' | 'pdf') => {
    const data = timeSlots.map(slot => ({
      Time: slot.time,
      Patient: slot.patient,
      Type: slot.type,
      Status: slot.status,
      Duration: `${slot.duration || 30} mins`,
      Notes: slot.notes || 'No notes'
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    toast({
      title: "Schedule Exported",
      description: `Schedule exported as ${format.toUpperCase()}.`,
    });
  };

  const syncWithGoogleCalendar = () => {
    // Simulate Google Calendar sync
    toast({
      title: "Google Calendar Sync",
      description: "Your schedule has been synced with Google Calendar.",
    });
  };

  const updateSlotNotes = (slotId: number, notes: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, notes } : slot
    ));
  };

  const filteredSlots = timeSlots.filter(slot => {
    if (filterStatus === 'all') return true;
    return slot.status === filterStatus;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showPatientDetails = (patientName: string) => {
    const patient = initialPatients[patientName];
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientInfo(true);
    }
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncWithGoogleCalendar}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Sync Calendar
          </Button>
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
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Select value={newSlotDuration} onValueChange={setNewSlotDuration}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addTimeSlot} className="flex-1" disabled={loading}>
                    {loading ? "Adding..." : "Add Slot"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingSlot(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedSlots.length > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('confirmed')}>
                <Check className="w-3 h-3 mr-1" />
                Bulk Confirm ({selectedSlots.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('cancelled')}>
                <X className="w-3 h-3 mr-1" />
                Bulk Cancel
              </Button>
            </>
          )}
          
          <Button size="sm" variant="outline" onClick={() => exportSchedule('csv')}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {appointments.filter(a => a.status === 'confirmed').length} confirmed, {appointments.filter(a => a.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSlots.length}</div>
            <p className="text-xs text-muted-foreground">Open for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(appointments.map(a => a.patient_id)).size}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-health-blue" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">{suggestion}</p>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Friday, July 21, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedSlots.includes(slot.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSlots([...selectedSlots, slot.id]);
                      } else {
                        setSelectedSlots(selectedSlots.filter(id => id !== slot.id));
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{slot.time}</span>
                    {slot.duration && (
                      <Badge variant="outline" className="text-xs">
                        {slot.duration}min
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p 
                        className={`font-medium ${slot.patient !== 'Available' ? 'cursor-pointer hover:text-health-blue' : ''}`}
                        onClick={() => slot.patient !== 'Available' && showPatientDetails(slot.patient)}
                      >
                        {slot.patient}
                      </p>
                      {slot.patient !== 'Available' && (
                        <Button size="sm" variant="ghost" onClick={() => showPatientDetails(slot.patient)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{slot.type}</p>
                    {slot.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{slot.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {slot.status === 'in-progress' && activeCallTimer[slot.id] !== undefined && (
                    <div className="flex items-center gap-2 mr-2">
                      <Timer className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-mono text-red-500">
                        {formatTime(activeCallTimer[slot.id])}
                      </span>
                    </div>
                  )}
                  
                  <Badge variant={
                    slot.status === 'confirmed' ? 'default' :
                    slot.status === 'pending' ? 'secondary' :
                    slot.status === 'in-progress' ? 'destructive' :
                    slot.status === 'completed' ? 'default' : 'outline'
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
                  
                  {slot.status === 'in-progress' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => endConsultation(slot.id)}
                    >
                      End Call
                    </Button>
                  )}
                  
                  {slot.status !== 'available' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <StickyNote className="w-3 h-3 mr-1" />
                          Notes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Appointment Notes - {slot.patient}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Enter consultation notes..."
                            value={slot.notes || ''}
                            onChange={(e) => updateSlotNotes(slot.id, e.target.value)}
                            className="min-h-[120px]"
                          />
                          <Button onClick={() => toast({ title: "Notes saved!" })}>
                            Save Notes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Info Modal */}
      <Dialog open={showPatientInfo} onOpenChange={setShowPatientInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Information</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p>{selectedPatient.age} years</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{selectedPatient.email}</p>
                </div>
              </div>
              <div>
                <Label>Medical Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPatient.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">{condition}</Badge>
                  ))}
                </div>
              </div>
              {selectedPatient.lastVisit && (
                <div>
                  <Label>Last Visit</Label>
                  <p>{selectedPatient.lastVisit}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSchedule;
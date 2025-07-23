import { useState, useEffect } from "react";
import { Calendar, Clock, User, Video, Phone, MapPin, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  available_slots_count: number;
}

interface AvailableSlot {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  doctor?: {
    full_name: string;
    specialization: string;
  };
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  status: string;
  reason: string;
  doctor: {
    full_name: string;
    specialization: string;
  };
}

export default function Appointments() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from database
  useEffect(() => {
    if (user && user.role === 'patient') {
      loadDoctors();
      loadAppointments();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || user.role !== 'patient') return;

    const appointmentsChannel = supabase
      .channel('patient-appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${user.id}`
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    const slotsChannel = supabase
      .channel('available-slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'available_slots'
        },
        () => {
          if (selectedDoctor) {
            loadAvailableSlots(selectedDoctor);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(slotsChannel);
    };
  }, [user, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase.rpc('get_available_doctors');
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadAvailableSlots = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('available_slots')
        .select(`
          *,
          doctor:profiles!available_slots_doctor_id_fkey(full_name, specialization)
        `)
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .order('start_time');

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:profiles!appointments_doctor_id_fkey(full_name, specialization)
        `)
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot || !appointmentReason || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a slot and provide a reason.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('book_appointment', {
        slot_id: selectedSlot,
        patient_id: user.id,
        appointment_type: appointmentType,
        reason: appointmentReason
      });

      if (error) throw error;

      setSelectedSlot("");
      setAppointmentReason("");
      setShowBookingDialog(false);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully booked.",
      });

      // Refresh data
      loadAppointments();
      if (selectedDoctor) {
        loadAvailableSlots(selectedDoctor);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    loadAvailableSlots(doctorId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground">Book and manage your medical appointments</p>
          </div>
        </div>
        
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <Label>Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={handleDoctorSelect}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{doctor.full_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {doctor.specialization} • {doctor.available_slots_count} slots
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Available Slots */}
              {selectedDoctor && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSlot === slot.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        <div className="text-sm font-medium">
                          {new Date(slot.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Reason for Visit</Label>
                <Textarea
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the visit..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={bookAppointment} 
                  className="flex-1" 
                  disabled={loading || !selectedSlot || !appointmentReason}
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
                <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search Appointments</Label>
              <Input
                placeholder="Search by doctor name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>
            {filteredAppointments.length} appointment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${appointment.doctor.full_name}`} />
                    <AvatarFallback>
                      {appointment.doctor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Dr. {appointment.doctor.full_name}</h3>
                      <Badge variant="secondary">{appointment.doctor.specialization}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.appointment_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {appointment.type}
                      </span>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  
                  {appointment.status === 'confirmed' && (
                    <Button size="sm">
                      <Video className="w-4 h-4 mr-1" />
                      Join Call
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found. Book your first appointment to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
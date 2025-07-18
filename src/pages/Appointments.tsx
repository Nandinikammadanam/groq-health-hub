import { useState } from "react";
import { Calendar, Clock, User, Video, Phone, MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number;
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'General Medicine',
    date: '2024-01-20',
    time: '10:00 AM',
    type: 'video',
    status: 'scheduled',
    duration: 30,
    notes: 'Follow-up consultation'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: '2024-01-15',
    time: '2:00 PM',
    type: 'in-person',
    status: 'completed',
    duration: 45
  }
];

const availableSlots = [
  { date: '2024-01-22', time: '9:00 AM', doctor: 'Dr. Sarah Johnson', specialty: 'General Medicine' },
  { date: '2024-01-22', time: '11:00 AM', doctor: 'Dr. Michael Chen', specialty: 'Cardiology' },
  { date: '2024-01-23', time: '10:00 AM', doctor: 'Dr. Emily Davis', specialty: 'Dermatology' },
  { date: '2024-01-23', time: '2:00 PM', doctor: 'Dr. James Wilson', specialty: 'Orthopedics' },
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctor: '',
    date: '',
    time: '',
    type: 'video' as 'video' | 'phone' | 'in-person',
    reason: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
    }
  };

  const handleBookAppointment = () => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorName: bookingForm.doctor,
      specialty: 'General Medicine',
      date: bookingForm.date,
      time: bookingForm.time,
      type: bookingForm.type,
      status: 'scheduled',
      duration: 30,
      notes: bookingForm.reason
    };

    setAppointments(prev => [...prev, newAppointment]);
    setShowBookingDialog(false);
    setBookingForm({
      doctor: '',
      date: '',
      time: '',
      type: 'video',
      reason: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage your healthcare appointments</p>
        </div>
        
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={bookingForm.doctor} onValueChange={(value) => setBookingForm(prev => ({ ...prev, doctor: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson (General Medicine)</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen (Cardiology)</SelectItem>
                    <SelectItem value="Dr. Emily Davis">Dr. Emily Davis (Dermatology)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={bookingForm.time} onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Consultation Type</Label>
                <Select value={bookingForm.type} onValueChange={(value: any) => setBookingForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleBookAppointment} className="w-full">
                Book Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="available">Available Slots</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {appointments.filter(apt => apt.status === 'scheduled').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">Schedule your next consultation with a healthcare provider</p>
                <Button onClick={() => setShowBookingDialog(true)}>Book Appointment</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.filter(apt => apt.status === 'scheduled').map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                          <Badge variant="outline">{appointment.specialty}</Badge>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {appointment.time} ({appointment.duration} min)
                          </div>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(appointment.type)}
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {appointment.type === 'video' && (
                          <Button size="sm" className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Join Call
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4">
            {appointments.filter(apt => apt.status === 'completed').map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                        <Badge variant="outline">{appointment.specialty}</Badge>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Summary
                      </Button>
                      <Button variant="outline" size="sm">
                        Book Follow-up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4">
            {availableSlots.map((slot, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{slot.doctor}</h3>
                      <p className="text-sm text-muted-foreground">{slot.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(slot.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {slot.time}
                        </div>
                      </div>
                    </div>
                    <Button>Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
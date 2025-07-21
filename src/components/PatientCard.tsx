import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Clock, Heart, FileText, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  conditions: string[];
  lastVisit: string;
  nextAppointment?: string;
  photo?: string;
  visits: Array<{
    id: string;
    date: string;
    type: string;
    notes: string;
    diagnosis?: string;
  }>;
}

interface PatientCardProps {
  patient: Patient;
  onUpdate?: (patient: Patient) => void;
}

export function PatientCard({ patient, onUpdate }: PatientCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [consultationType, setConsultationType] = useState("follow-up");
  const [diagnosis, setDiagnosis] = useState("");
  const { toast } = useToast();

  const addConsultation = () => {
    if (!consultationNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please enter consultation notes.",
        variant: "destructive",
      });
      return;
    }

    const newVisit = {
      id: Math.random().toString(36),
      date: new Date().toLocaleDateString(),
      type: consultationType,
      notes: consultationNotes,
      diagnosis: diagnosis || undefined
    };

    const updatedPatient = {
      ...patient,
      visits: [newVisit, ...patient.visits],
      lastVisit: new Date().toLocaleDateString()
    };

    onUpdate?.(updatedPatient);
    setConsultationNotes("");
    setDiagnosis("");
    setShowAddConsultation(false);

    toast({
      title: "Consultation Added",
      description: "New consultation has been recorded for the patient.",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (condition: string) => {
    const colors = {
      'hypertension': 'bg-red-100 text-red-800',
      'diabetes': 'bg-orange-100 text-orange-800',
      'asthma': 'bg-blue-100 text-blue-800',
      'depression': 'bg-purple-100 text-purple-800',
      'anxiety': 'bg-yellow-100 text-yellow-800',
    };
    return colors[condition.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={patient.photo} />
                <AvatarFallback className="bg-health-blue text-white">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{patient.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.age} years • {patient.gender}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddConsultation(true)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last visit: {patient.lastVisit}
            </div>
            
            {patient.conditions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className={getStatusColor(condition)}>
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.nextAppointment && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-health-blue" />
                <span>Next: {patient.nextAppointment}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={patient.photo} />
                <AvatarFallback className="bg-health-blue text-white text-lg">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <p className="text-muted-foreground">{patient.age} years old • {patient.gender}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{patient.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Medical Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className={getStatusColor(condition)}>
                      {condition}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visit History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Visit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.visits.map((visit) => (
                    <div key={visit.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{visit.type}</Badge>
                          <span className="text-sm text-muted-foreground">{visit.date}</span>
                        </div>
                        {visit.diagnosis && (
                          <Badge variant="secondary">{visit.diagnosis}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{visit.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Consultation Dialog */}
      <Dialog open={showAddConsultation} onOpenChange={setShowAddConsultation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Consultation Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Consultation Type</Label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-background"
              >
                <option value="follow-up">Follow-up</option>
                <option value="check-up">Check-up</option>
                <option value="emergency">Emergency</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis if applicable"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Consultation Notes</Label>
              <Textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Enter detailed consultation notes..."
                className="mt-1 min-h-[120px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addConsultation} className="flex-1">
                Save Consultation
              </Button>
              <Button variant="outline" onClick={() => setShowAddConsultation(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
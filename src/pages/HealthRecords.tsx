import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Download, Eye, Calendar, Activity, FileDown, Search, Filter, Plus, UserPlus, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PatientCard } from "@/components/PatientCard";

interface HealthRecord {
  id: string;
  title: string;
  type: 'lab' | 'prescription' | 'imaging' | 'consultation' | 'vaccination';
  date: string;
  fileUrl?: string;
  summary?: string;
  provider?: string;
}

const mockRecords: HealthRecord[] = [
  {
    id: '1',
    title: 'Blood Test Results',
    type: 'lab',
    date: '2024-01-15',
    summary: 'Complete blood count - All values normal',
    provider: 'City Lab'
  },
  {
    id: '2',
    title: 'Annual Physical Consultation',
    type: 'consultation',
    date: '2024-01-10',
    summary: 'Routine checkup - Patient in good health',
    provider: 'Dr. Sarah Johnson'
  },
  {
    id: '3',
    title: 'Blood Pressure Medication',
    type: 'prescription',
    date: '2024-01-08',
    summary: 'Lisinopril 10mg daily',
    provider: 'Dr. Sarah Johnson'
  }
];

// Mock patients data for doctor view
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'male' as const,
    phone: '+1 (555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, Springfield, IL',
    conditions: ['Hypertension', 'Diabetes'],
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-15',
    photo: undefined,
    visits: [
      {
        id: '1',
        date: '2024-01-15',
        type: 'consultation',
        notes: 'Routine checkup - blood pressure stable, diabetes well controlled',
        diagnosis: 'Stable chronic conditions'
      },
      {
        id: '2', 
        date: '2024-01-01',
        type: 'follow-up',
        notes: 'Medication adjustment - increased metformin dose',
        diagnosis: 'Diabetes medication adjustment'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    age: 32,
    gender: 'female' as const,
    phone: '+1 (555) 987-6543', 
    email: 'sarah.wilson@email.com',
    address: '456 Oak Ave, Springfield, IL',
    conditions: ['Asthma'],
    lastVisit: '2024-01-10',
    photo: undefined,
    visits: [
      {
        id: '3',
        date: '2024-01-10',
        type: 'consultation',
        notes: 'Asthma well controlled with current inhaler regimen',
        diagnosis: 'Asthma - stable'
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Johnson',
    age: 28,
    gender: 'male' as const,
    phone: '+1 (555) 456-7890',
    email: 'mike.johnson@email.com', 
    address: '789 Pine St, Springfield, IL',
    conditions: ['Anxiety'],
    lastVisit: '2023-12-15',
    photo: undefined,
    visits: [
      {
        id: '4',
        date: '2023-12-15',
        type: 'consultation',
        notes: 'Initial consultation for anxiety symptoms, started on sertraline 50mg',
        diagnosis: 'Generalized anxiety disorder'
      }
    ]
  }
];

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>(mockRecords);
  const [patients, setPatients] = useState(mockPatients);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordTitle, setRecordTitle] = useState("");
  const [recordType, setRecordType] = useState<HealthRecord['type']>('lab');
  const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    conditions: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = () => {
    if (!selectedFile || !recordTitle) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title.",
        variant: "destructive",
      });
      return;
    }

    const newRecord: HealthRecord = {
      id: Math.random().toString(36),
      title: recordTitle,
      type: recordType,
      date: new Date().toISOString().split('T')[0],
      fileUrl: URL.createObjectURL(selectedFile),
      provider: 'Self-uploaded'
    };

    setRecords([newRecord, ...records]);
    setSelectedFile(null);
    setRecordTitle("");
    
    toast({
      title: "Record uploaded successfully",
      description: "Your health record has been added.",
    });
  };

  const getTypeColor = (type: HealthRecord['type']) => {
    const colors = {
      lab: "bg-blue-100 text-blue-800",
      prescription: "bg-green-100 text-green-800",
      imaging: "bg-purple-100 text-purple-800",
      consultation: "bg-orange-100 text-orange-800",
      vaccination: "bg-red-100 text-red-800",
    };
    return colors[type];
  };

  const getTypeIcon = (type: HealthRecord['type']) => {
    const icons = {
      lab: Activity,
      prescription: FileText,
      imaging: Eye,
      consultation: Calendar,
      vaccination: Activity,
    };
    const Icon = icons[type];
    return <Icon className="w-4 h-4" />;
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      const summary = `PATIENT SUMMARY - ${new Date().toLocaleDateString()}\n\nTotal Records: ${records.length}\n\nRecent Activity:\n${records.slice(0, 3).map(r => `• ${r.title} (${r.date})`).join('\n')}\n\nRecommendations:\n• Regular follow-up appointments\n• Continue current medication regimen\n• Monitor vital signs weekly`;
      
      setGeneratedSummary(summary);
      setIsGeneratingSummary(false);
      
      toast({
        title: "Summary Generated",
        description: "Patient summary has been generated successfully.",
      });
    }, 2000);
  };

  const exportAllRecords = () => {
    const csvContent = [
      'Title,Type,Date,Provider,Summary',
      ...records.map(r => `"${r.title}","${r.type}","${r.date}","${r.provider || ''}","${r.summary || ''}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Records Exported",
      description: "All health records have been exported to CSV.",
    });
  };

  const viewRecord = (record: HealthRecord) => {
    setViewingRecord(record);
  };

  const downloadRecord = (record: HealthRecord) => {
    if (record.fileUrl) {
      const a = document.createElement('a');
      a.href = record.fileUrl;
      a.download = `${record.title}.pdf`;
      a.click();
      
      toast({
        title: "Download Started",
        description: "Record file download has started.",
      });
    }
  };

  const addNewPatient = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.phone || !newPatient.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const patient = {
      id: Math.random().toString(36),
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender as 'male' | 'female' | 'other',
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address,
      conditions: newPatient.conditions ? newPatient.conditions.split(',').map(c => c.trim()) : [],
      lastVisit: new Date().toLocaleDateString(),
      nextAppointment: undefined,
      photo: undefined,
      visits: []
    };

    setPatients([patient, ...patients]);
    setNewPatient({
      name: "",
      age: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      conditions: ""
    });
    setShowAddPatient(false);

    toast({
      title: "Patient Added",
      description: "New patient has been added successfully.",
    });
  };

  const updatePatient = (updatedPatient: typeof patients[0]) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  // Different views for different user roles
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  // Filter records based on search and filters
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesDate = !filterDate || record.date >= filterDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Filter patients for doctor view
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isPatient ? 'My Health Records' : isDoctor ? 'Patient Management' : 'Patient Records'}
            </h1>
            <p className="text-muted-foreground">
              {isPatient 
                ? 'Manage your medical documents and history' 
                : isDoctor
                ? 'Manage your patients and their medical records'
                : 'Access and manage patient medical records'
              }
            </p>
          </div>
        </div>
        
        {isDoctor && (
          <Button onClick={() => setShowAddPatient(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      {(isDoctor || !isPatient) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search {isDoctor ? 'Patients' : 'Records'}</Label>
                <Input
                  placeholder={isDoctor ? "Search by name or email..." : "Search records..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              {!isDoctor && (
                <>
                  <div>
                    <Label>Filter by Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="lab">Lab Results</SelectItem>
                        <SelectItem value="prescription">Prescriptions</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="consultation">Consultations</SelectItem>
                        <SelectItem value="vaccination">Vaccinations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section - Only for patients */}
      {isPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Record Title</label>
                <Input
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g., Blood Test Results"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Record Type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as HealthRecord['type'])}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="lab">Lab Results</option>
                  <option value="prescription">Prescription</option>
                  <option value="imaging">Imaging</option>
                  <option value="consultation">Consultation Notes</option>
                  <option value="vaccination">Vaccination Record</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Upload File</label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="mt-1"
              />
            </div>

            <Button onClick={handleFileUpload} className="w-full">
              Upload Record
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Doctor Patient View */}
      {isDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onUpdate={updatePatient}
            />
          ))}
        </div>
      )}

      {/* Records List - For Patients and Non-Doctor Views */}
      {!isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isPatient ? 'Your Records' : 'Patient Records'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    {getTypeIcon(record.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{record.title}</h3>
                      <Badge variant="secondary" className={getTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                    </div>
                    {record.summary && (
                      <p className="text-sm text-muted-foreground">{record.summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{record.date}</span>
                      {record.provider && <span>• {record.provider}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewRecord(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {record.fileUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadRecord(record)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor-specific features */}
      {isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={generateSummary}
                disabled={isGeneratingSummary}
              >
                <FileText className="w-6 h-6 mb-2" />
                {isGeneratingSummary ? "Generating..." : "Generate Summary"}
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Upload className="w-6 h-6 mb-2" />
                Upload Patient Record
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={exportAllRecords}
              >
                <Download className="w-6 h-6 mb-2" />
                Export All Records
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient-specific Export */}
      {isPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAllRecords} className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Export All My Records
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Record Dialog */}
      <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingRecord?.title}</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">{viewingRecord.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-muted-foreground">{viewingRecord.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-muted-foreground">{viewingRecord.provider}</p>
                </div>
              </div>
              {viewingRecord.summary && (
                <div>
                  <label className="text-sm font-medium">Summary</label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingRecord.summary}</p>
                </div>
              )}
              {viewingRecord.fileUrl && (
                <div className="flex gap-2">
                  <Button onClick={() => downloadRecord(viewingRecord)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generated Summary Dialog */}
      <Dialog open={!!generatedSummary} onOpenChange={() => setGeneratedSummary("")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Patient Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={generatedSummary}
              readOnly
              className="min-h-[300px]"
            />
            <div className="flex gap-2">
              <Button onClick={() => {
                navigator.clipboard.writeText(generatedSummary);
                toast({
                  title: "Copied to Clipboard",
                  description: "Summary has been copied to clipboard.",
                });
              }}>
                Copy to Clipboard
              </Button>
              <Button variant="outline" onClick={() => {
                const blob = new Blob([generatedSummary], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `patient-summary-${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={newPatient.name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Age *</Label>
              <Input
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={newPatient.phone}
                onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                value={newPatient.address}
                onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Medical Conditions</Label>
              <Input
                value={newPatient.conditions}
                onChange={(e) => setNewPatient(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder="Enter conditions separated by commas"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={addNewPatient} className="flex-1">
              Add Patient
            </Button>
            <Button variant="outline" onClick={() => setShowAddPatient(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
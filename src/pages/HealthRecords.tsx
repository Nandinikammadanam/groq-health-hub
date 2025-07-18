import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>(mockRecords);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordTitle, setRecordTitle] = useState("");
  const [recordType, setRecordType] = useState<HealthRecord['type']>('lab');
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

  // Different views for different user roles
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isPatient ? 'My Health Records' : 'Patient Records'}
          </h1>
          <p className="text-muted-foreground">
            {isPatient 
              ? 'Manage your medical documents and history' 
              : 'Access and manage patient medical records'
            }
          </p>
        </div>
      </div>

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

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPatient ? 'Your Records' : 'Patient Records'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
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
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {record.fileUrl && (
                    <Button variant="outline" size="sm">
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

      {/* Doctor-specific features */}
      {isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                Generate Summary
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Upload className="w-6 h-6 mb-2" />
                Upload Patient Record
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="w-6 h-6 mb-2" />
                Export All Records
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
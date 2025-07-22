import { useState } from "react";
import { Heart, Activity, Thermometer, Scale, Eye, Stethoscope, Plus, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VitalReading {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar' | 'oxygen_saturation';
  value: string;
  unit: string;
  date: string;
  time: string;
  notes?: string;
}

const initialVitals: VitalReading[] = [];

const bloodPressureData = [
  { date: '2024-01-15', systolic: 0, diastolic: 0 },
  { date: '2024-01-16', systolic: 0, diastolic: 0 },
  { date: '2024-01-17', systolic: 0, diastolic: 0 },
  { date: '2024-01-18', systolic: 0, diastolic: 0 },
];

const vitalTypes = [
  { type: 'blood_pressure', label: 'Blood Pressure', icon: Heart, unit: 'mmHg', normalRange: '90/60 - 120/80' },
  { type: 'heart_rate', label: 'Heart Rate', icon: Activity, unit: 'bpm', normalRange: '60-100' },
  { type: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°F', normalRange: '97-99°F' },
  { type: 'weight', label: 'Weight', icon: Scale, unit: 'lbs', normalRange: 'Varies' },
  { type: 'blood_sugar', label: 'Blood Sugar', icon: Eye, unit: 'mg/dL', normalRange: '70-100' },
  { type: 'oxygen_saturation', label: 'Oxygen Saturation', icon: Stethoscope, unit: '%', normalRange: '95-100%' },
];

export default function Vitals() {
  const [vitals, setVitals] = useState<VitalReading[]>(initialVitals);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVital, setNewVital] = useState({
    type: 'blood_pressure',
    value: '',
    notes: ''
  });

  const handleAddVital = () => {
    const vitalType = vitalTypes.find(v => v.type === newVital.type);
    if (!vitalType || !newVital.value) return;

    const vital: VitalReading = {
      id: Date.now().toString(),
      type: newVital.type as any,
      value: newVital.value,
      unit: vitalType.unit,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: newVital.notes || undefined
    };

    setVitals(prev => [vital, ...prev]);
    setShowAddDialog(false);
    setNewVital({ type: 'blood_pressure', value: '', notes: '' });
  };

  const getLatestReading = (type: string) => {
    return vitals.find(v => v.type === type);
  };

  const getVitalStatus = (type: string, value: string) => {
    // Simple status logic - in real app, this would be more sophisticated
    switch (type) {
      case 'blood_pressure':
        const [systolic] = value.split('/').map(Number);
        if (systolic > 140) return 'high';
        if (systolic < 90) return 'low';
        return 'normal';
      case 'heart_rate':
        const hr = Number(value);
        if (hr > 100) return 'high';
        if (hr < 60) return 'low';
        return 'normal';
      case 'temperature':
        const temp = Number(value);
        if (temp > 99.5) return 'high';
        if (temp < 97) return 'low';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-health-red';
      case 'low': return 'text-health-yellow';
      case 'normal': return 'text-health-green';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vitals Tracker</h1>
          <p className="text-muted-foreground">Monitor your health vitals and track trends</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Vital Reading</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Vital Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newVital.type}
                  onChange={(e) => setNewVital(prev => ({ ...prev, type: e.target.value }))}
                >
                  {vitalTypes.map(type => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  placeholder={`Enter value (${vitalTypes.find(v => v.type === newVital.type)?.unit})`}
                  value={newVital.value}
                  onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  placeholder="Add any notes..."
                  value={newVital.notes}
                  onChange={(e) => setNewVital(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              
              <Button onClick={handleAddVital} className="w-full">
                Add Reading
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vitalTypes.map((vitalType) => {
          const Icon = vitalType.icon;
          const latestReading = getLatestReading(vitalType.type);
          const status = latestReading ? getVitalStatus(vitalType.type, latestReading.value) : 'normal';
          
          return (
            <Card key={vitalType.type}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="w-5 h-5 text-health-primary" />
                  {vitalType.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(status)}`}>
                      {latestReading?.value || '--'}
                    </span>
                    <span className="text-sm text-muted-foreground">{vitalType.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Normal: {vitalType.normalRange}
                  </p>
                  {latestReading && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {latestReading.date} at {latestReading.time}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Blood Pressure Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Blood Pressure Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="hsl(var(--health-primary))" 
                  strokeWidth={2}
                  name="Systolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="hsl(var(--health-secondary))" 
                  strokeWidth={2}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vitals.slice(0, 10).map((vital) => {
              const vitalType = vitalTypes.find(v => v.type === vital.type);
              const Icon = vitalType?.icon || Activity;
              const status = getVitalStatus(vital.type, vital.value);
              
              return (
                <div key={vital.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-health-primary" />
                    <div>
                      <p className="font-medium">{vitalType?.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {vital.date} at {vital.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getStatusColor(status)}`}>
                      {vital.value} {vital.unit}
                    </p>
                    {vital.notes && (
                      <p className="text-xs text-muted-foreground">{vital.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
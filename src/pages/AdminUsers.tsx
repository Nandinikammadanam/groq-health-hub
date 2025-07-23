import { useState, useEffect } from "react";
import { Users, UserPlus, Search, Filter, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePatients: 0,
    activeDoctors: 0,
    pendingApprovals: 0
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "patient",
    phone: "",
    location: ""
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from database
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
      loadStats();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const usersChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadUsers();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
    };
  }, [user]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(profile => ({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        location: profile.address,
        status: 'active', // You can add a status field to the profiles table
        lastActive: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('role');

      if (usersError) throw usersError;

      const totalUsers = allUsers?.length || 0;
      const activePatients = allUsers?.filter(u => u.role === 'patient').length || 0;
      const activeDoctors = allUsers?.filter(u => u.role === 'doctor').length || 0;
      const pendingApprovals = 0; // You can implement pending approvals logic

      setStats({
        totalUsers,
        activePatients,
        activeDoctors,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user via Supabase Auth (you would need to implement admin user creation)
      // For now, just add to profiles table directly
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // Generate a UUID for the id field
          email: newUser.email,
          full_name: newUser.name,
          role: newUser.role as 'patient' | 'doctor' | 'admin',
          phone: newUser.phone,
          address: newUser.location
        });

      if (error) throw error;

      setNewUser({ name: "", email: "", role: "patient", phone: "", location: "" });
      setIsAddingUser(false);
      
      toast({
        title: "User Added",
        description: "New user has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = (userId: number, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    toast({
      title: "Status Updated",
      description: `User status updated to ${newStatus}.`,
    });
  };

  const deleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "User Deleted",
      description: "User has been removed from the system.",
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the HealthMate AI system
          </p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md bg-background"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newUser.location}
                  onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                  placeholder="Enter location"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addUser} className="flex-1" disabled={loading}>
                  {loading ? "Adding..." : "Add User"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddingUser(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDoctors}</div>
            <p className="text-xs text-muted-foreground">Medical professionals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and manage all system users</CardDescription>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </span>
                      )}
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Badge variant={
                    user.status === 'active' ? 'default' :
                    user.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {user.status}
                  </Badge>
                  {user.status === 'pending' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'active')}
                    >
                      Approve
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
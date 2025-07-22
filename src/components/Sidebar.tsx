import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  Heart, 
  Calendar, 
  FileText, 
  Book, 
  Users, 
  Settings,
  LogOut,
  User,
  Activity,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const patientItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "AI Symptom Checker", url: "/symptom-checker", icon: MessageSquare },
  { title: "Mental Health", url: "/mental-health", icon: Heart },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Health Records", url: "/records", icon: FileText },
  { title: "Education Hub", url: "/education", icon: Book },
  { title: "Vitals Tracker", url: "/vitals", icon: Activity },
];

const doctorItems = [
  { title: "Doctor Dashboard", url: "/doctor", icon: Stethoscope },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Calendar },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Settings },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "System Logs", url: "/admin/logs", icon: FileText },
];

interface SidebarProps {
  userRole?: 'patient' | 'doctor' | 'admin';
  userName?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ userRole = 'patient', userName = 'User', collapsed = false, onCollapse }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const getMenuItems = () => {
    switch (userRole) {
      case 'doctor':
        return doctorItems;
      case 'admin':
        return adminItems;
      default:
        return patientItems;
    }
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <div className={cn(
      "bg-card border-r border-border h-full flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">HealthMate AI</h2>
              <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-health-blue rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Welcome back!</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {getMenuItems().map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (window.confirm('Are you sure you want to logout?')) {
              try {
                const { useAuth } = await import('@/hooks/useAuth');
                const { logout } = useAuth.getState();
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
                window.location.href = '/login';
              }
            }
          }}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "px-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
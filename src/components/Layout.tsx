import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'patient' | 'doctor' | 'admin';
  userName?: string;
}

export function Layout({ children, userRole = 'patient', userName = 'nandini' }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar 
        userRole={userRole}
        userName={userName}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 overflow-auto">
          {/* Pass userRole to children */}
          {typeof children === 'object' && children !== null && 'type' in children 
            ? { ...children, props: { ...children.props, userRole } } 
            : children}
        </main>
      </div>
    </div>
  );
}
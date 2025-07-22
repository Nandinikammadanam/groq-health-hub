import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const { profile, isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const getHomeRoute = () => {
    if (!isAuthenticated || !profile) return "/";
    
    switch (profile.role) {
      case 'doctor':
        return '/doctor/schedule';
      case 'admin':
        return '/admin/users';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-foreground mb-4">Oops! Page not found</p>
        <Link to={getHomeRoute()} className="text-primary hover:text-primary/80 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

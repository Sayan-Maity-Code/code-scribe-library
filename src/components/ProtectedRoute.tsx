
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "./ui/skeleton";

interface ProtectedRouteProps {
  allowedRole?: "admin" | "member";
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user doesn't have it
  if (allowedRole && user.user_metadata.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

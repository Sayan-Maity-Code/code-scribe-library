
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching users with admin permissions");
        
        // Our improved RLS policies should now allow this query for admin users
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*');
        
        if (fetchError) {
          console.error("Fetch error:", fetchError);
          throw fetchError;
        }
        
        if (!data) {
          console.error("No data returned");
          throw new Error("No data returned from profiles query");
        }
        
        console.log("Profiles data received:", data);
        
        // Transform profiles data to match User structure with safer null handling
        const transformedUsers = data.map(profile => ({
          id: profile.id,
          email: profile.email || "No email",
          user_metadata: {
            role: profile.role || "member",
            full_name: profile.email ? profile.email.split('@')[0] : "Unknown"
          }
        })) as User[];
        
        console.log("Transformed users:", transformedUsers);
        setUsers(transformedUsers);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
        toast({
          title: "Error fetching users",
          description: `Could not retrieve user data: ${(err as Error).message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch users if the current user is logged in and is an admin
    if (currentUser && currentUser.user_metadata?.role === 'admin') {
      fetchUsers();
    } else if (currentUser && currentUser.user_metadata?.role !== 'admin') {
      setError("You do not have permission to access this page");
      toast({
        title: "Access denied",
        description: "You must be an admin to view this page",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast, currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.user_metadata?.full_name || "Not provided"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.user_metadata?.role === "admin" ? "default" : "outline"}>
                          {user.user_metadata?.role || "member"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

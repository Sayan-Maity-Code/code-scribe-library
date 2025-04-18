
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft } from "lucide-react";

export const ManageUsersPage = () => {
  const [search, setSearch] = useState("");
  
  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userApi.getAllUsers,
  });

  // Filter users based on search
  const filteredUsers = users?.filter((user) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    const role = user.user_metadata?.role?.toLowerCase() || "";
    const name = user.user_metadata?.full_name?.toLowerCase() || "";
    
    return email.includes(searchLower) || role.includes(searchLower) || name.includes(searchLower);
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          asChild
        >
          <Link to="/admin">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage library members</p>
      </div>

      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredUsers?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No users found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search</p>
          <Button onClick={() => setSearch("")} variant="outline" className="mt-4">
            Clear Search
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Sign In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.user_metadata?.full_name || "Not provided"}</TableCell>
                <TableCell>
                  <Badge variant={user.user_metadata?.role === "admin" ? "default" : "outline"}>
                    {user.user_metadata?.role || "member"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

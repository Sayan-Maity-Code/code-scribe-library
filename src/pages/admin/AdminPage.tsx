
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { bookApi, borrowApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Users, BookCheck, PlusCircle } from "lucide-react";
import { BorrowRequestList } from "@/components/admin/BorrowRequestList";

export const AdminPage = () => {
  const { user } = useAuth();

  // Get book count
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["admin-books"],
    queryFn: () => bookApi.getAllBooks(),
  });

  // Get borrow requests
  const { data: borrowRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["borrowRequests"],
    queryFn: () => borrowApi.getAllBorrows("requested"),
  });

  // Compute stats
  const totalBooks = books?.length || 0;
  const availableBooks = books?.filter(book => book.available).length || 0;
  const pendingRequests = borrowRequests?.length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage library resources and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Books
            </CardTitle>
            <CardDescription>Total books in library</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBooks ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{totalBooks}</div>
            )}
            <p className="text-sm text-muted-foreground">
              {isLoadingBooks ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `${availableBooks} available for borrowing`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-primary" />
              Borrow Requests
            </CardTitle>
            <CardDescription>Pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{pendingRequests}</div>
            )}
            <p className="text-sm text-muted-foreground">
              Waiting for your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link to="/admin/users">
              <Button size="sm">View Users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <Link to="/admin/books/add">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New Book
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Borrow Requests</TabsTrigger>
          <TabsTrigger value="books">Manage Books</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="requests">
            <BorrowRequestList />
          </TabsContent>
          <TabsContent value="books">
            <div className="flex justify-center">
              <div className="space-y-4 max-w-md w-full">
                <Link to="/admin/books" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Book className="h-5 w-5" />
                    View All Books
                  </Button>
                </Link>
                <Link to="/admin/books/add" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Add New Book
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

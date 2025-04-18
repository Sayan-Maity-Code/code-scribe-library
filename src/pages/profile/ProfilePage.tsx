
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { borrowApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "@/components/BookCard";
import { format } from "date-fns";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReturning, setIsReturning] = useState<string | null>(null);

  // Fetch user borrows
  const { data: userBorrows, isLoading } = useQuery({
    queryKey: ["userBorrows"],
    queryFn: () => borrowApi.getUserBorrows(user!.id),
    enabled: !!user,
  });

  // Return book mutation
  const returnMutation = useMutation({
    mutationFn: (borrowId: string) => borrowApi.returnBook(borrowId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book returned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["userBorrows"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to return book: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsReturning(null);
    },
  });

  const handleReturnBook = (borrowId: string) => {
    setIsReturning(borrowId);
    returnMutation.mutate(borrowId);
  };

  // Filter borrows by status
  const currentBorrows = userBorrows?.filter(
    borrow => borrow.status === "approved"
  );
  
  const pendingRequests = userBorrows?.filter(
    borrow => borrow.status === "requested"
  );
  
  const returnedBooks = userBorrows?.filter(
    borrow => borrow.status === "returned"
  );

  const renderBorrowList = (borrows: typeof userBorrows, showReturnButton: boolean = false) => {
    if (!borrows?.length) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No books in this category</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {borrows.map((borrow) => (
          <div 
            key={borrow.id}
            className="flex flex-col md:flex-row gap-6 p-4 bg-white rounded-lg border"
          >
            <div className="w-full md:w-1/5 lg:w-1/6">
              <BookCard book={borrow.book} showAvailability={false} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold">{borrow.book.title}</h3>
                <p className="text-muted-foreground">{borrow.book.author}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Borrow Date</p>
                  <p>{format(new Date(borrow.borrow_date), "PP")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p>{format(new Date(borrow.due_date), "PP")}</p>
                </div>
                
                {borrow.return_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Return Date</p>
                    <p>{format(new Date(borrow.return_date), "PP")}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant={
                  borrow.status === "approved" ? "default" : 
                  borrow.status === "requested" ? "secondary" : 
                  "outline"
                }>
                  {borrow.status === "approved" ? "Currently borrowed" : 
                   borrow.status === "requested" ? "Pending approval" : 
                   "Returned"}
                </Badge>
                
                {showReturnButton && (
                  <Button 
                    onClick={() => handleReturnBook(borrow.id)}
                    disabled={isReturning === borrow.id}
                    variant="outline"
                  >
                    {isReturning === borrow.id ? "Processing..." : "Return Book"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          {user?.email} • {user?.user_metadata.role}
        </p>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Borrows</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="history">Borrow History</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="current">
            {renderBorrowList(currentBorrows, true)}
          </TabsContent>
          
          <TabsContent value="pending">
            {renderBorrowList(pendingRequests)}
          </TabsContent>
          
          <TabsContent value="history">
            {renderBorrowList(returnedBooks)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};


import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { bookApi, borrowApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Hash,
  Tag,
  ChevronLeft,
} from "lucide-react";

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isBorrowing, setIsBorrowing] = useState(false);

  // Fetch book details
  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => (id ? bookApi.getBookById(id) : null),
    enabled: !!id,
  });

  // Mutation to borrow a book
  const borrowMutation = useMutation({
    mutationFn: () => borrowApi.requestBorrow(id!, user!.id),
    onSuccess: () => {
      toast({
        title: "Borrow request submitted",
        description: "Your request has been submitted and is awaiting approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["book", id] });
      queryClient.invalidateQueries({ queryKey: ["userBorrows"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit borrow request: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsBorrowing(false);
    },
  });

  const handleBorrowRequest = () => {
    if (!user) return;
    
    setIsBorrowing(true);
    borrowMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/books")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Books
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="h-[400px] w-[300px] rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist</p>
        <Button onClick={() => navigate("/books")} className="mt-4">
          Go Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/books")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Books
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] w-full bg-muted rounded-lg overflow-hidden mb-4">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 border">
                <BookOpen className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {book.available ? (
              <Badge className="w-full bg-green-500 hover:bg-green-600 flex justify-center py-1 text-base">
                Available
              </Badge>
            ) : (
              <Badge className="w-full bg-yellow-500 hover:bg-yellow-600 flex justify-center py-1 text-base">
                Borrowed
              </Badge>
            )}

            {user && book.available && (
              <Button
                onClick={handleBorrowRequest}
                disabled={isBorrowing}
                className="w-full"
              >
                {isBorrowing ? "Processing..." : "Borrow this Book"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{book.author}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <span>Category: </span>
              <Badge variant="outline">{book.category}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <span>ISBN: </span>
              <span className="text-muted-foreground">{book.isbn}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3>About this book</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit
              amet aliquam tincidunt, nunc massa aliquam nunc, eget aliquam nunc nisl eu
              nisi. Sed euismod, nunc sit amet aliquam tincidunt, nunc massa aliquam nunc,
              eget aliquam nunc nisl eu nisi.
            </p>
            <p>
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
              cubilia curae; Donec euismod, nunc sit amet aliquam tincidunt, nunc massa
              aliquam nunc, eget aliquam nunc nisl eu nisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

export const ManageBooksPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch all books
  const { data: books, isLoading } = useQuery({
    queryKey: ["admin-books", searchQuery],
    queryFn: () => bookApi.getAllBooks(searchQuery),
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookApi.deleteBook(id),
    onSuccess: () => {
      toast({
        title: "Book deleted",
        description: "The book has been successfully removed from the library",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete book: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeleteId(null);
    },
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
  };

  // Handle delete book
  const handleDeleteBook = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <p className="text-muted-foreground">Add, edit or remove books from the library</p>
        </div>
        <Link to="/admin/books/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Book
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books..."
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
      ) : books?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No books found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search or add new books</p>
          <Link to="/admin/books/add">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add New Book
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books?.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>
                  {book.available ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Borrowed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Link to={`/books/${book.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Book">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={`/admin/books/edit/${book.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit Book">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete Book"
                    onClick={() => setDeleteId(book.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this book from the library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

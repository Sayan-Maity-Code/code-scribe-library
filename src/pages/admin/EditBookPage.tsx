
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { bookApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  category: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
  cover_image: z.instanceof(FileList).optional(),
});

export const EditBookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch book details
  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => (id ? bookApi.getBookById(id) : null),
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      category: "",
      available: true,
      cover_image: undefined,
    },
  });

  // Update form with book details when available
  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        available: book.available,
      });
      
      setPreviewUrl(book.cover_image);
    }
  }, [book, form]);

  // Handle cover image change
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update book mutation
  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!id) throw new Error("No book ID provided");
      
      // If there's a new cover image, upload it first
      let coverImage = book?.cover_image || null;
      if (data.cover_image && data.cover_image.length > 0) {
        coverImage = await bookApi.uploadCoverImage(data.cover_image[0]);
      }

      // Update the book with the image URL
      return await bookApi.updateBook(id, {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        category: data.category,
        available: data.available,
        cover_image: coverImage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Book updated",
        description: "The book has been successfully updated",
      });
      navigate("/admin/books");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update book: ${(error as Error).message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <p className="text-muted-foreground mt-2">The book you're trying to edit doesn't exist</p>
        <Button onClick={() => navigate("/admin/books")} className="mt-4">
          Go Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          asChild
        >
          <Link to="/admin/books">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Books
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Book</h1>
        <p className="text-muted-foreground">Update the details of this book</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cover_image"
                render={() => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormDescription>Upload a new cover image to replace the existing one</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available for borrowing</FormLabel>
                      <FormDescription>
                        Mark this book as available in the library
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-x-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating Book..." : "Update Book"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/books")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="order-first md:order-last">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-xl font-semibold">Cover Preview</h2>
            <div className="aspect-[2/3] w-full bg-muted rounded-lg overflow-hidden border flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <p>No cover image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

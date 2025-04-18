import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  category: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
  cover_image: z.instanceof(FileList).optional(),
});

export const AddBookPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // Handle cover image change
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Create book mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log("Starting book creation with form data:", data);
      
      // If there's a cover image, upload it first
      let coverImageUrl = null;
      if (data.cover_image && data.cover_image.length > 0) {
        console.log("Uploading cover image...");
        coverImageUrl = await bookApi.uploadCoverImage(data.cover_image[0]);
        console.log("Cover image uploaded, URL:", coverImageUrl);
      }

      // Create the book with the image URL - using cover_image_url to match DB schema
      return await bookApi.createBook({
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        category: data.category,
        available: data.available,
        cover_image_url: coverImageUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: "Book added",
        description: "The book has been successfully added to the library",
      });
      navigate("/admin/books");
    },
    onError: (error) => {
      console.error("Error in createMutation:", error);
      toast({
        title: "Error",
        description: `Failed to add book: ${(error as Error).message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    await createMutation.mutateAsync(data);
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
          <Link to="/admin/books">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Books
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add New Book</h1>
        <p className="text-muted-foreground">Enter the details of the new book</p>
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
                      <Input placeholder="Enter the title of the book" {...field} />
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
                      <Input placeholder="Enter the author's name" {...field} />
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
                        <Input placeholder="Enter the ISBN" {...field} />
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
                        <Input placeholder="E.g. Fiction, Science, History" {...field} />
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
                    <FormDescription>Upload a cover image for the book (optional)</FormDescription>
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
                  {isSubmitting ? "Adding Book..." : "Add Book"}
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
                  <p className="text-sm">Preview will be shown here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import { supabase, Book } from "../supabase";

export const bookApi = {
  // Get all books with optional search parameters
  getAllBooks: async (search?: string, category?: string, available?: boolean) => {
    let query = supabase.from("books").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (available !== undefined) {
      query = query.eq("available", available);
    }

    const { data, error } = await query.order("title");
    
    if (error) {
      throw error;
    }
    
    return data as Book[];
  },

  getBookById: async (id: string) => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Book;
  },

  createBook: async (book: Omit<Book, "id" | "created_at" | "updated_at">) => {
    console.log("Creating book with data:", book);
    const { data, error } = await supabase
      .from("books")
      .insert([book])
      .select();
    
    if (error) {
      console.error("Error creating book:", error);
      throw error;
    }
    
    return data[0] as Book;
  },

  updateBook: async (id: string, book: Partial<Book>) => {
    const { data, error } = await supabase
      .from("books")
      .update({ ...book, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Book;
  },

  deleteBook: async (id: string) => {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw error;
    }
    
    return true;
  },

  uploadCoverImage: async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `book-covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("library")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("library").getPublicUrl(filePath);

    return data.publicUrl;
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from("books")
      .select("category")
      .order("category");
    
    if (error) {
      throw error;
    }
    
    const categories = [...new Set(data.map(book => book.category))];
    return categories;
  },
};

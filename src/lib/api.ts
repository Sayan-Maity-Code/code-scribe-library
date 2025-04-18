import { supabase, Book, Borrow, BorrowStatus, BorrowWithBook } from "./supabase";

// Books API
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

  // Get a single book by ID
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

  // Create a new book
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

  // Update a book
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

  // Delete a book
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

  // Upload a book cover image
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

  // Get all unique book categories
  getCategories: async () => {
    const { data, error } = await supabase
      .from("books")
      .select("category")
      .order("category");
    
    if (error) {
      throw error;
    }
    
    // Get unique categories
    const categories = [...new Set(data.map(book => book.category))];
    return categories;
  },
};

// Borrows API
export const borrowApi = {
  // Request to borrow a book
  requestBorrow: async (bookId: string, userId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now
    
    const borrow = {
      book_id: bookId,
      user_id: userId,
      status: "requested" as BorrowStatus,
      borrow_date: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      return_date: null,
    };
    
    const { data, error } = await supabase
      .from("borrows")
      .insert([borrow])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },

  // Update borrow status (admin only)
  updateBorrowStatus: async (borrowId: string, status: BorrowStatus) => {
    let updateData: any = { status };
    
    if (status === "returned") {
      updateData.return_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("borrows")
      .update(updateData)
      .eq("id", borrowId)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },

  // Get user's borrows with book details
  getUserBorrows: async (userId: string) => {
    const { data, error } = await supabase
      .from("borrows")
      .select(`
        *,
        book:book_id (*)
      `)
      .eq("user_id", userId)
      .order("borrow_date", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as BorrowWithBook[];
  },

  // Get all borrows with book and user details (admin only)
  getAllBorrows: async (status?: BorrowStatus) => {
    let query = supabase
      .from("borrows")
      .select(`
        *,
        book:book_id (*),
        user:user_id (*)
      `)
      .order("borrow_date", { ascending: false });
      
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Borrow[];
  },

  // Return a book
  returnBook: async (borrowId: string) => {
    const { data, error } = await supabase
      .from("borrows")
      .update({
        status: "returned" as BorrowStatus,
        return_date: new Date().toISOString(),
      })
      .eq("id", borrowId)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },
};

// Users API
export const userApi = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    return data.users;
  },
};

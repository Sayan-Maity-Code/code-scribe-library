
import { createClient } from "@supabase/supabase-js";

// Supabase setup with fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Add more informative error handling
  throw new Error(`
    Supabase configuration is incomplete. 
    Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.
    
    If you're using Lovable:
    1. Click on the Supabase integration button
    2. Ensure all environment variables are correctly configured
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define database types
export type User = {
  id: string;
  email: string;
  user_metadata: {
    role: "admin" | "member";
    full_name?: string;
  };
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  cover_image_url: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
};

export type BorrowStatus = "requested" | "approved" | "denied" | "returned";

export type Borrow = {
  id: string;
  book_id: string;
  user_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: BorrowStatus;
  book: Book;
  user: User;
};

export type BorrowWithBook = Borrow & {
  book: Book;
};

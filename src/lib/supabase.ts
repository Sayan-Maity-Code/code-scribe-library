
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
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

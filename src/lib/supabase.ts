
import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase configuration using project details
const SUPABASE_URL = "https://robvrhglervyftgwdzlc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYnZyaGdsZXJ2eWZ0Z3dkemxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5OTg4MDEsImV4cCI6MjA2MDU3NDgwMX0.PPvEg7dDqn5h0p2W1yLHbN9SuYLfpIwzU1BJSHmEQ3w";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(`
    Supabase configuration is incomplete. 
    Please ensure Supabase URL and Anon Key are correctly configured.
    
    If you're using Lovable:
    1. Click on the Supabase integration button
    2. Ensure all environment variables are correctly configured
  `);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

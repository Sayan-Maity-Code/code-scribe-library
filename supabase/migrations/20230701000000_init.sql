
-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'denied', 'returned')),
  borrow_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, user_id, status)
);

-- Create storage for book covers
INSERT INTO storage.buckets (id, name, public) VALUES ('library', 'library', true);

-- Set up row level security policies

-- Books table policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Anyone can read books
CREATE POLICY "Anyone can read books" 
  ON books FOR SELECT 
  USING (TRUE);

-- Only admins can insert, update, delete books
CREATE POLICY "Admins can insert books" 
  ON books FOR INSERT 
  WITH CHECK ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update books" 
  ON books FOR UPDATE 
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete books" 
  ON books FOR DELETE 
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Borrows table policies
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;

-- Users can read their own borrows, admins can read all
CREATE POLICY "Users can read their own borrows" 
  ON borrows FOR SELECT 
  USING (auth.uid() = user_id OR (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Users can request borrows
CREATE POLICY "Users can request borrows" 
  ON borrows FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND status = 'requested');

-- Users can update their own returned status
CREATE POLICY "Users can return their books" 
  ON borrows FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'approved')
  WITH CHECK (status = 'returned');

-- Admins can update any borrow status
CREATE POLICY "Admins can update any borrow status" 
  ON borrows FOR UPDATE 
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Storage policies for book covers
CREATE POLICY "Public can read book covers" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'library');

CREATE POLICY "Admins can upload book covers" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'library' AND (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update book covers" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'library' AND (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete book covers" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'library' AND (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Create function to update book availability when borrow status changes
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- When a borrow is approved, make the book unavailable
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE books SET available = FALSE WHERE id = NEW.book_id;
  -- When a book is returned, make it available again
  ELSIF NEW.status = 'returned' AND OLD.status != 'returned' THEN
    UPDATE books SET available = TRUE WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating book availability
CREATE TRIGGER update_book_availability_trigger
AFTER UPDATE ON borrows
FOR EACH ROW
EXECUTE FUNCTION update_book_availability();

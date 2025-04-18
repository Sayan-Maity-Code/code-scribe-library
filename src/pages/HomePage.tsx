
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { BookOpen, BookPlus, Users, BookCheck } from "lucide-react";

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to the Library Management System</h1>
        <p className="text-xl text-muted-foreground">
          A modern platform to manage books, members, and borrowing workflows
        </p>
      </div>

      {!user ? (
        <div className="flex gap-4">
          <Link to="/login">
            <Button size="lg">Log In</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Register</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link to="/books">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Browse Books
            </Button>
          </Link>

          {user.user_metadata.role === "admin" && (
            <Link to="/admin">
              <Button size="lg" variant="outline" className="gap-2">
                <Users className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          )}

          <Link to="/profile">
            <Button size="lg" variant="outline" className="gap-2">
              <BookCheck className="h-5 w-5" />
              My Borrows
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <BookOpen className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Extensive Collection</h3>
          <p className="text-muted-foreground">
            Browse through thousands of books across various categories and genres
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <BookPlus className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Easy Borrowing</h3>
          <p className="text-muted-foreground">
            Simple process to borrow and return books with just a few clicks
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <BookCheck className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Track Your Reading</h3>
          <p className="text-muted-foreground">
            Keep track of your reading history and borrowed books in one place
          </p>
        </div>
      </div>
    </div>
  );
};

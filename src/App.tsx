
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/Layout";

// Auth Pages
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";

// Main Pages
import { HomePage } from "@/pages/HomePage";
import { BooksPage } from "@/pages/books/BooksPage";
import { BookDetailPage } from "@/pages/books/BookDetailPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

// Admin Pages
import { AdminPage } from "@/pages/admin/AdminPage";
import { ManageBooksPage } from "@/pages/admin/ManageBooksPage";
import { ManageUsersPage } from "@/pages/admin/ManageUsersPage";
import { AddBookPage } from "@/pages/admin/AddBookPage";
import { EditBookPage } from "@/pages/admin/EditBookPage";

// Auth Guard
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected routes for all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="books" element={<BooksPage />} />
                <Route path="books/:id" element={<BookDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/books" element={<ManageBooksPage />} />
                <Route path="admin/books/add" element={<AddBookPage />} />
                <Route path="admin/books/edit/:id" element={<EditBookPage />} />
                <Route path="admin/users" element={<ManageUsersPage />} />
              </Route>

              {/* Catch-all route for 404s */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

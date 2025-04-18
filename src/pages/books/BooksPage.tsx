
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, FilterX } from "lucide-react";

import { bookApi } from "@/lib/api";
import { Book } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/BookCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const BooksPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState(false);

  // Fetch books with filters
  const {
    data: books,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["books", searchQuery, category, availableOnly],
    queryFn: () => bookApi.getAllBooks(searchQuery, category, availableOnly ? true : undefined),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: bookApi.getCategories,
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSearchQuery("");
    setCategory("");
    setAvailableOnly(false);
  };

  // Navigate to book details
  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Library Collection</h1>
        <p className="text-muted-foreground">Browse our collection of books</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="available"
              checked={availableOnly}
              onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
            />
            <Label htmlFor="available">Available Only</Label>
          </div>

          <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : books?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No books found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          <Button onClick={resetFilters} variant="outline" className="mt-4">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books?.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => handleBookClick(book.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

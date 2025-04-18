
import { Book } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  showAvailability?: boolean;
}

export const BookCard = ({ book, onClick, showAvailability = true }: BookCardProps) => {
  const defaultCoverUrl = "https://via.placeholder.com/200x300?text=No+Cover";

  return (
    <div 
      className="rounded-lg border bg-white overflow-hidden flex flex-col transition-all 
                hover:shadow-md cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="aspect-[2/3] w-full bg-muted relative">
        {book.cover_image_url ? (
          <img 
            src={book.cover_image_url} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {showAvailability && (
          <div className="absolute top-2 right-2">
            {book.available ? (
              <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
            ) : (
              <Badge variant="secondary">Borrowed</Badge>
            )}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold line-clamp-1">{book.title}</h3>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="outline">{book.category}</Badge>
          <span className="text-xs text-muted-foreground">{book.isbn}</span>
        </div>
      </div>
    </div>
  );
};

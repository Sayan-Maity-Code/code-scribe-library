
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-6 border-t bg-slate-50">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-2 text-sm">
        <p className="flex items-center gap-1">
          Made with <Heart className="h-4 w-4 text-red-500" /> by Library System Team
        </p>
        <p className="text-muted-foreground">© {new Date().getFullYear()} Library Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

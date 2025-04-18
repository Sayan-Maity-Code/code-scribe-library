
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { BorrowStatus } from "@/lib/supabase";
import { CheckCircle, XCircle } from "lucide-react";

export const BorrowRequestList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch borrow requests
  const { data: borrowRequests, isLoading } = useQuery({
    queryKey: ["borrowRequests"],
    queryFn: () => borrowApi.getAllBorrows("requested"),
  });

  // Update borrow status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BorrowStatus }) =>
      borrowApi.updateBorrowStatus(id, status),
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Borrow request has been processed",
      });
      queryClient.invalidateQueries({ queryKey: ["borrowRequests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  // Handle approve and deny requests
  const handleUpdateStatus = (id: string, status: BorrowStatus) => {
    setProcessingId(id);
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!borrowRequests?.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-slate-50">
        <p className="text-lg text-muted-foreground">No pending borrow requests</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book Title</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {borrowRequests?.map((borrow) => (
          <TableRow key={borrow.id}>
            <TableCell className="font-medium">{borrow.book.title}</TableCell>
            <TableCell>{borrow.user.email}</TableCell>
            <TableCell>{format(new Date(borrow.borrow_date), "PPp")}</TableCell>
            <TableCell className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => handleUpdateStatus(borrow.id, "approved")}
                disabled={processingId === borrow.id}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => handleUpdateStatus(borrow.id, "denied")}
                disabled={processingId === borrow.id}
              >
                <XCircle className="h-4 w-4 text-red-500" />
                Deny
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

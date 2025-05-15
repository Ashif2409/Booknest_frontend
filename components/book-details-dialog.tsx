"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface BookDetailsDialogProps {
  book: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifyReturn: (userId: string, bookId: string) => void;
}

export function BookDetailsDialog({
  book,
  open,
  onOpenChange,
  onVerifyReturn,
}: BookDetailsDialogProps) {
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [returnedBy, setReturnedBy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!book || !open) return;

      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const borrowersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/book/books/${book._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const returnedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/confirmReturn`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (borrowersResponse.ok && returnedResponse.ok) {
          const borrowersData = await borrowersResponse.json();
          const returnedData = await returnedResponse.json();

          const borrowerUserIds: string[] = Array.isArray(borrowersData.book.borrower)
            ? borrowersData.book.borrower
            : [];

          if (borrowerUserIds.length > 0) {
            const userDetailsPromises = borrowerUserIds.map(async (userId: string) => {
              const userDetailsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/id/${userId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const userDetails = await userDetailsResponse.json();
              const borrowerBooks = userDetails.bookBorrow || [];

              const relevantBorrowedBooks = borrowerBooks
                .filter((borrowedBook: any) => borrowedBook.bookId === book._id)
                .map((borrowedBook: any) => ({
                  userId,
                  bookId: borrowedBook.bookId,
                  username: userDetails.username,
                  bookname: borrowedBook.bookname,
                  Due_Date: borrowedBook.Due_Date,
                  IssueDate: borrowedBook.IssueDate,
                  fine: borrowedBook.fine,
                  returned: borrowedBook.returned,
                  verifyReturn: borrowedBook.verifyReturn,
                }));

              return relevantBorrowedBooks;
            });

            const resolvedUserDetails = await Promise.all(userDetailsPromises);
            setBorrowers(resolvedUserDetails.flat());
          } else {
            setBorrowers([]);
          }

          const filteredReturnedData = Array.isArray(returnedData)
            ? returnedData.flatMap((returned: any) => {
                return (returned.bookBorrow || []).map((b: any) => {
                  if (b.returned && !b.verifyReturn) {
                    return {
                      username: returned.username,
                      issueDate: b.IssueDate,
                      returnDate: b.returnDate || new Date().toISOString(),
                    };
                  }
                  return null;
                }).filter(Boolean);
              })
            : [];

          setReturnedBy(filteredReturnedData);
        } else {
          throw new Error("Failed to fetch book details");
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [book, open]);

  const handleVerifyReturn = (userId: string, bookId: string) => {
    onVerifyReturn(userId, bookId);

    setBorrowers((prev) =>
      prev.filter((b) => !(b.userId === userId && b.bookId === bookId))
    );

    setReturnedBy((prev) => [
      ...prev,
      {
        ...borrowers.find((b) => b.userId === userId && b.bookId === bookId),
        returnDate: new Date().toISOString(),
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{book?.bookname}</DialogTitle>
          <DialogDescription>
            Book details and borrowing history
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-500">Author</p>
            <p className="font-medium">{book?.author}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Genre</p>
            <p className="font-medium">{book?.genre}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Language</p>
            <p className="font-medium">{book?.language}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <div>
              {book?.number_of_copies > 0 ? (
                <Badge className="bg-emerald-500">Available</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  Borrowed
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="borrowed">
          <TabsList>
            <TabsTrigger value="borrowed">Currently Borrowed</TabsTrigger>
            <TabsTrigger value="returned">Return History</TabsTrigger>
          </TabsList>

          <TabsContent value="borrowed" className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : borrowers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">User</th>
                      <th className="py-2 px-4 text-left">Issue Date</th>
                      <th className="py-2 px-4 text-left">Due Date</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowers.map((borrower, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-4">{borrower.username}</td>
                        <td className="py-2 px-4">{formatDate(borrower.IssueDate)}</td>
                        <td className="py-2 px-4">{formatDate(borrower.Due_Date)}</td>
                        <td className="py-2 px-4">
                          <Button size="sm" onClick={() => handleVerifyReturn(borrower.userId, borrower.bookId)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify Return
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-slate-500">No one is currently borrowing this book.</p>
            )}
          </TabsContent>

          <TabsContent value="returned" className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : returnedBy.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">User</th>
                      <th className="py-2 px-4 text-left">Issue Date</th>
                      <th className="py-2 px-4 text-left">Return Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnedBy.map((returner, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-4">{returner.username}</td>
                        <td className="py-2 px-4">{formatDate(returner.issueDate)}</td>
                        <td className="py-2 px-4">{formatDate(returner.returnDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-slate-500">No return history available.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

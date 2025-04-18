
import { supabase, Borrow, BorrowStatus, BorrowWithBook } from "../supabase";

export const borrowApi = {
  requestBorrow: async (bookId: string, userId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now
    
    const borrow = {
      book_id: bookId,
      user_id: userId,
      status: "requested" as BorrowStatus,
      borrow_date: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      return_date: null,
    };
    
    const { data, error } = await supabase
      .from("borrows")
      .insert([borrow])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },

  updateBorrowStatus: async (borrowId: string, status: BorrowStatus) => {
    let updateData: any = { status };
    
    if (status === "returned") {
      updateData.return_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("borrows")
      .update(updateData)
      .eq("id", borrowId)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },

  getUserBorrows: async (userId: string) => {
    const { data, error } = await supabase
      .from("borrows")
      .select(`
        *,
        book:book_id (*)
      `)
      .eq("user_id", userId)
      .order("borrow_date", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as BorrowWithBook[];
  },

  getAllBorrows: async (status?: BorrowStatus) => {
    let query = supabase
      .from("borrows")
      .select(`
        *,
        book:book_id (*),
        user:user_id (*)
      `)
      .order("borrow_date", { ascending: false });
      
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Borrow[];
  },

  returnBook: async (borrowId: string) => {
    const { data, error } = await supabase
      .from("borrows")
      .update({
        status: "returned" as BorrowStatus,
        return_date: new Date().toISOString(),
      })
      .eq("id", borrowId)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0] as Borrow;
  },
};

import { Request, Response } from "express";
import { db } from "../db";
import { authorsTable, booksTable, usersBooksTable } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { middleWareRequest } from "../types";
import { toNum } from "../utils/fun";

export const createBook = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, cover, authorId } = req.body;
    if (!name || !price)
      return res
        .status(400)
        .json({ msg: "name and type properties are required" });

    const newBook = await db
      .insert(booksTable)
      .values({
        name,
        price,
        stock: Math.abs(stock) || 0,
        cover: cover || null,
        authorId: authorId || null,
      })
      .returning();

    return res
      .status(200)
      .json({ msg: "Book created sccessfully", data: newBook[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const { name, offset, limit } = req.query;
    const defaultLimit = 10;
    const defaultOffset = 0;

    const bookList = await db
      .select()
      .from(booksTable)
      .where(sql`LOWER(books.name)~LOWER(${name || ""})`)
      .limit(toNum(limit) || defaultLimit)
      .offset(toNum(offset) || defaultOffset)
      .fullJoin(authorsTable, eq(booksTable.authorId, authorsTable.id));

    if (bookList.length == 0)
      return res.status(404).json({ msg: "No books Found!" });

    return res.status(200).json({ data: bookList });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const updateBookById = async (req: Request, res: Response) => {
  try {
    const { name, stock, price, cover, authorId } = req.body;
    const { id } = req.params;

    const book = await db
      .update(booksTable)
      .set({ stock, name, price, cover, authorId })
      .where(eq(booksTable.id, parseInt(id)))
      .returning();

    if (book.length == 0)
      return res.status(404).json({ msg: "No book with such id!" });

    return res
      .status(200)
      .json({ msg: "Book updated successfully!", data: book[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const deleteBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await db
      .delete(booksTable)
      .where(eq(booksTable.id, parseInt(id)))
      .returning();

    if (book.length == 0)
      return res.status(404).json({ msg: "No book with such an id!" });

    return res
      .status(200)
      .json({ msg: "Book was deleted successfully!", data: book[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const buyBook = async (req: middleWareRequest, res: Response) => {
  try {
    const { bookId, amount, paymentInfo } = req.body;

    if (!bookId || !paymentInfo)
      return res.status(400).json({ msg: "All fields are required" });

    const available = await db
      .select({ stock: booksTable.stock })
      .from(booksTable)
      .where(eq(booksTable.id, bookId));

    if (available.length == 0)
      return res.status(404).json({ msg: "No such book with this id" });
    if (available[0].stock < amount)
      return res.status(400).json({ msg: "Not enought amount of this boook" });

    //payment logic:
    //....
    console.log("payment happened with data: " + paymentInfo);

    const { updatedBook, transaction } = await db.transaction(async (trx) => {
      const updatedBook = await trx
        .update(booksTable)
        .set({ stock: available[0].stock - amount })
        .where(eq(booksTable.id, bookId))
        .returning();

      const transaction = await trx
        .insert(usersBooksTable)
        .values({ userId: req.id!, bookId, amount })
        .returning();

      return { updatedBook, transaction };
    });

    return res.status(200).json({
      msg: "Payment affected successfully!",
      data: {
        purchasedBook: updatedBook,
        transactionId: transaction,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const getPurchasedBooks = async (
  req: middleWareRequest,
  res: Response
) => {
  try {
    const purchases = await db
      .select({
        books: booksTable,
        id: usersBooksTable.userId,
        amount: usersBooksTable.amount,
        time: usersBooksTable.createdAt,
      })
      .from(usersBooksTable)
      .where(eq(usersBooksTable.userId, req.id!))
      .fullJoin(booksTable, eq(usersBooksTable.bookId, booksTable.id));

    if (purchases.length == 0)
      return res.status(404).json({ msg: "You have made no purchases!" });

    return res.status(200).json({ data: purchases });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};


import { Request, Response } from "express";
import { db } from "../db";
import { authorsTable, booksTable } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const createBook = async (req: Request, res: Response) => {
  try {
    const { name, type, stock, cover, authorId } = req.body;
    if (!name || !type)
      return res
        .status(400)
        .json({ msg: "name and type properties are required" });

    const newBook = await db
      .insert(booksTable)
      .values({
        name,
        type,
        stock: Math.abs(stock) || 0,
        cover: cover || null,
        authorId: authorId || null,
      })
      .returning({
        id: booksTable.id,
        name: booksTable.name,
        type: booksTable.type,
        cover: booksTable.cover,
        stock: booksTable.stock,
        authorId: booksTable.authorId,
      });

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
      .where(sql`LOWER(books.name) ~ LOWER(${name})`)
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
    const { name, stock, type, cover, authorId } = req.body;
    const { id } = req.params;

    const book = await db
      .update(booksTable)
      .set({ stock, name, type, cover, authorId })
      .where(eq(booksTable.id, parseInt(id)))
      .returning({
        id: booksTable.id,
        stock: booksTable.stock,
        name: booksTable.name,
        authorId: booksTable.authorId,
        type: booksTable.type,
        cover: booksTable.cover,
      });

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


const isString = (input: any): input is string => {
  return typeof input == "string";
};

const toNum = (input: any): number | null => {
  if (isString(input)) return parseInt(input);
  return null;
};

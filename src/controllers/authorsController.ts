import { Request, Response } from "express";
import { db } from "../db";
import { authorsTable } from "../db/schema";
import { toNum } from "../utils/fun";
import { eq, sql } from "drizzle-orm";

export const createAuthor = async (req: Request, res: Response) => {
  try {
    const { name, alive } = req.body;
    if (!name) return res.status(400).json({ msg: "All fields are required" });

    if (typeof name != "string" || typeof alive != "boolean")
      throw new Error("Types missmatch");

    const newAuthor = await db
      .insert(authorsTable)
      .values({ name, alive })
      .returning();

    if (newAuthor.length == 0)
      return res.status(400).json({ msg: "Author wansn't created!" });

    return res
      .status(200)
      .json({ msg: "Author created successfully", data: newAuthor });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const getAllAuthors = async (req: Request, res: Response) => {
  try {
    const { offset, limit, name } = req.query;
    const defaultLimit = 10;
    const defaultOffset = 0;

    const authorsList = await db
      .select()
      .from(authorsTable)
      .where(sql`LOWER(name)~LOWER(${name || ""})`)
      .limit(toNum(limit) || defaultLimit)
      .offset(toNum(offset) || defaultOffset);

    if (authorsList.length == 0)
      return res.status(404).json({ msg: "No authors found!" });

    return res.status(200).json({ msg: "authors found", data: authorsList });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const updateAuthor = async (req: Request, res: Response) => {
  try {
    const { name, alive } = req.body;
    const { id } = req.params;

    const updatedAuthor = await db
      .update(authorsTable)
      .set({ name: name, alive })
      .where(eq(authorsTable.id, parseInt(id)))
      .returning();

    if (!updateAuthor)
      return res.status(400).json({ msg: "author wasn't updated!" });

    return res
      .status(200)
      .json({ msg: "author updated successfully!", data: updatedAuthor[0] });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(500).send(error.message);
    }
    return res.status(500).send("server error");
  }
};

export const deleteAuthor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAuthor = await db
      .delete(authorsTable)
      .where(eq(authorsTable.id, parseInt(id) || 0))
      .returning();

    if (deletedAuthor.length == 0)
      return res.status(400).json({ msg: "No author with this id" });

    return res
      .status(200)
      .json({ msg: "Author deleted succussfully", data: deletedAuthor[0] });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) return res.status(500).send(error.message);
    return res.status(500).send("Server error");
  }
};

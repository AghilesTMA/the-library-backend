import { relations } from "drizzle-orm";
import {
  integer,
  serial,
  pgTable,
  varchar,
  text,
  boolean,
  index,
  primaryKey,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
});

export const authorsTable = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  alive: boolean("alive").notNull(),
});

export const booksTable = pgTable(
  "books",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    stock: integer("stock").notNull().default(0),
    cover: text("cover"),
    authorId: integer("authorId").references(() => authorsTable.id),
    price: real("price").notNull().default(0),
  },
  (table) => ({
    indexTable: index().on(table.name),
  })
);

export const usersBooksTable = pgTable(
  "users-books",
  {
    userId: integer("userId")
      .notNull()
      .references(() => usersTable.id),
    bookId: integer("bookId")
      .notNull()
      .references(() => booksTable.id),
    amount: integer("amount").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.bookId, table.createdAt, table.amount],
    }),
  })
);

export const userRelations = relations(usersTable, ({ many }) => ({
  userBooks: many(usersBooksTable),
}));

export const booksRelations = relations(booksTable, ({ one, many }) => ({
  author: one(authorsTable, {
    fields: [booksTable.authorId],
    references: [authorsTable.id],
  }),
  usersBooks: many(usersBooksTable),
}));

export const usersBooksRelations = relations(usersBooksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [usersBooksTable.userId],
    references: [usersTable.id],
  }),
  books: one(booksTable, {
    fields: [usersBooksTable.bookId],
    references: [booksTable.id],
  }),
}));

export type selectUser = typeof usersTable.$inferSelect;
export type insertUser = typeof usersTable.$inferInsert;

export type selectBook = typeof booksTable.$inferSelect;
export type insertBook = typeof booksTable.$inferInsert;

export type selectAuthor = typeof authorsTable.$inferSelect;
export type insertAuthor = typeof authorsTable.$inferInsert;

export type selectUserBook = typeof usersBooksTable.$inferSelect;
export type insertUserBook = typeof usersBooksTable.$inferInsert;

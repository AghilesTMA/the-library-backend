import { insertUser, usersTable } from "./schema";
import { db } from "./index";

export const addUser = async (data: insertUser) => {
  const user = await db.insert(usersTable).values(data);
};

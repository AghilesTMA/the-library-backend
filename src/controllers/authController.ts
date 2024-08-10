import { Request, Response } from "express";
import { usersTable } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { hash, genSalt, compare } from "bcrypt";
import { cookieOptions } from "../config";
import jwt, { VerifyErrors } from "jsonwebtoken";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required!" });

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length > 0)
      return res
        .status(400)
        .json({ msg: "User with this email already exits!" });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const newUser = await db
      .insert(usersTable)
      .values({
        email,
        name,
        password: hashedPassword,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatar: usersTable.avatar,
        role: usersTable.role,
      });

    const token = jwt.sign(newUser[0], process.env.TOKEN_SECRET!, {
      expiresIn: "3d",
    });

    res.cookie("jwt", token, cookieOptions);

    return res
      .status(200)
      .json({ data: newUser[0], msg: "User Created successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const logIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRes = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (userRes.length == 0)
      return res
        .status(400)
        .json({ msg: "User with this email doesn't exist!" });

    let user = userRes[0];
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ msg: "wrong password" });

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    const token = jwt.sign(data, process.env.TOKEN_SECRET!, {
      expiresIn: "3d",
    });
    res.cookie("jwt", token, cookieOptions);
    return res.status(200).json({ data, msg: "logged in successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const logOut = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.jwt) return res.sendStatus(204);
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
    });
    return res.status(200).json({ msg: "cookie cleared" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.sendStatus(204);
    jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
      <JwtPayload>(
        error: VerifyErrors | null,
        decoded: JwtPayload | undefined
      ) => {
        if (error) return res.status(403).json({ msg: "Forbidden!" });
        return res.status(200).json({ msg: "User logged in", data: decoded });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

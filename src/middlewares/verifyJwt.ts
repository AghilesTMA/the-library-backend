import { NextFunction, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { middleWareRequest } from "../types";

export const verifyJwt = async (
  req: middleWareRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(403).json({ msg: "forbidden!" });

    jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
      <JwtPayload>(
        error: VerifyErrors | null,
        decoded: JwtPayload | undefined
      ) => {
        if (error) return res.status(401).json({ msg: "unauthorized!" });
        if (
          decoded &&
          typeof decoded == "object" &&
          "id" in decoded &&
          typeof decoded.id == "number"
        ) {
          req.id = decoded.id;
        }
      }
    );
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

import { middleWareRequest } from "../../types";
import { Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";

export const verifyRole = (role: "admin" | "user") => {
  return async (req: middleWareRequest, res: Response, next: NextFunction) => {
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
            "role" in decoded &&
            typeof decoded.role == "string"
          ) {
            if (decoded.role != role)
              return res.status(403).json({ msg: "access denied!" });
            next();

          } else {
            return res.status(401).json({ msg: "unauthorized!" });
          }
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  };
};

type cookieOpt = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "none" | "strict";
  maxAge: number;
};

export const cookieOptions: cookieOpt = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const whiteList = [""];
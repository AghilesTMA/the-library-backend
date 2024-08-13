import { Request } from "express";

export interface middleWareRequest extends Request {
  id?: number;
}

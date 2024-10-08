import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";

import catchAsync from "../utils/catchAsync";
import { TUserRole } from "../modules/user/user.interface";
import { CustomRequest, TTokenUser } from "../types/common";
import UserModel from "../modules/user/user.model";

const auth = (...requiredRole: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // CHECK TOKEN IS GIVEN OR NOT
    if (!token) {
      throw new AppError(401, "You are not authorized");
    }

    // VERIFY TOKEN
    let decode;
    try {
      decode = jwt.verify(token.split(" ")[1], config.jwt_access_secret as string) as TTokenUser;
    } catch (error) {
      throw new AppError(401, "Unauthorized");
    }
    const { role, email, iat } = decode;

    // CHECK USER EXIST OR NOT
    if (email) {
      const user = await UserModel.findOne({ email, role });
      if (!user) {
        throw new AppError(401, "Unauthorized");
      }
    }

    (req as CustomRequest).user = decode;
    next();
  });
};

export default auth;

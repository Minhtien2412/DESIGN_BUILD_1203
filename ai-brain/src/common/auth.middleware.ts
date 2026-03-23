import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>("AI_INTERNAL_TOKEN", "");
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing service token");
    }

    const provided = authHeader.slice(7);
    if (!this.token || provided !== this.token) {
      throw new UnauthorizedException("Invalid service token");
    }

    next();
  }
}

/**
 * Repository Interface: IAuthRepository
 * ======================================
 * Contract for authentication data access.
 */

import type {
    AuthResponse,
    AuthTokens,
    LoginDto,
    RegisterDto,
    User,
} from "../entities/User";

export interface IAuthRepository {
  login(dto: LoginDto): Promise<AuthResponse>;
  register(dto: RegisterDto): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  updateProfile(data: Partial<User>): Promise<User>;
}

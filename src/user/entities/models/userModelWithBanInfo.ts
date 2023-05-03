export interface IUserModelWithBanInfo {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  banDate: string;
  banReason: string;
  isBanned: string;
  code: string;
  expirationDate: string;
  isConfirmed: boolean;
}

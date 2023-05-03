export interface IUserDBModel {
  id: string;
  login: string;
  email: string;
  passwordHash?: string;
  createdAt: Date;
}

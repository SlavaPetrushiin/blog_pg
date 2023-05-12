export interface IUserModelWithRecoveryCode {
  login: string;
  email: string;
  recoveryCode: string;
  expirationDate: string;
  userID: string;
}

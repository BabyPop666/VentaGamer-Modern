export type UserInfo = {
  id: number;
  username: string;
  roleName: string;
  languageCode: string;
  permissions: string[];
};

export type AuthResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: UserInfo;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterUserRequest = {
  email: string;
  name: string;
  username: string;
  password: string;
};

export type UserResponse = {
  username: string;
  name: string;
  token?: string;
};

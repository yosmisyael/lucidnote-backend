export type RegisterUserRequest = {
  email: string;
  name: string;
  username: string;
  password: string;
};

export type LoginUserRequest = {
  username: string;
  password: string;
};

export type UpdateUserRequest = {
  name?: string;
  username?: string;
  password?: string;
};

export type UserResponse = {
  username: string;
  name: string;
  token?: string;
};

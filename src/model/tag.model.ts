export type CreateTagRequest = {
  name: string;
};

export type UpdateTagRequest = {
  id: string;
  name: string;
};

export type TagResponse = {
  id: string;
  name: string;
};

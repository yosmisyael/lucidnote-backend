export type Tag = {
  id: string;
  name: string;
};

export type CreateNoteRequest = {
  title: string;
  body: string | null;
  tags: { id: string }[];
};

export type UpdateNoteRequest = {
  id: string;
  title: string;
  body: string | null;
  tags: { id: string }[];
};

export type NoteResponse = {
  id: string;
  title: string | null;
  body: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  tags?: Tag[];
};

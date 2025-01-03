import { ResourceFile } from "./resources";
import { TagModel } from "./tag";

export interface MemoModel {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  content: string;
  pinned: boolean;
  private: boolean;
  archived: boolean;
  tags?: TagModel[];
  files?: File[] | ResourceFile[];
}

export interface UpdateMemoModel {
  id: number;
  userId: string;
  content: string;
  tagIds: number[];
  initialTagIds: number[];
  initialFiles: ResourceFile[];
  files: Array<ResourceFile | File>;
}

export interface CreateMemoModel {
  content: string;
  userId: string;
  tagIds: number[];
}

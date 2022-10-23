import type { FileObject } from '@supabase/storage-js';

export interface IFile extends FileObject {
  path: string | null;
  signedUrl: string | null;
}

export interface IFolder extends FileObject {
  path: string | null;
}

export type FilePreview = string | null;

export interface IStoreContext {
  globalDirPath: string;
  setGlobalDirPath: React.Dispatch<React.SetStateAction<string>>;
  files: IFile[];
  setFiles: React.Dispatch<React.SetStateAction<IFile[]>>;
  filePreview: FilePreview;
  setFilePreview: React.Dispatch<React.SetStateAction<FilePreview>>;
  folders: IFolder[];
  setFolders: React.Dispatch<React.SetStateAction<IFolder[]>>;
}

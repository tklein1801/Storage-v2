import * as React from 'react';
import type { FilePreview, IFile, IFolder, IStoreContext } from '../types/store.interface';

export const StoreContext = React.createContext({} as IStoreContext);

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [globalDirPath, setGlobalDirPath] = React.useState('');
  const [files, setFiles] = React.useState<IFile[]>([]);
  const [filePreview, setFilePreview] = React.useState<FilePreview>(null);
  const [folders, setFolders] = React.useState<IFolder[]>([]);

  return (
    <StoreContext.Provider
      value={{
        globalDirPath,
        setGlobalDirPath,
        files,
        setFiles,
        filePreview,
        setFilePreview,
        folders,
        setFolders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

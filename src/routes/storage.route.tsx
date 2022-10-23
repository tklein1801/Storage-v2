import * as React from 'react';
import { Box } from '@mui/material';
import { StoreContext } from '../context/store.context';
import { StorageService } from '../service/storage.service';
import { StorageLayout } from '../layout/storage.layout';
import { FolderWrapper } from '../components/folder.component';
import { FileWrapper } from '../components/file.component';
import { Spinner } from '../components/spinner.component';
import { AuthContext } from '../context/auth.context';
import { preparePath } from '../utils/path.utils';

export const Storage: React.FC<{ dirPath: string }> = ({ dirPath }) => {
  const { session } = React.useContext(AuthContext);
  const { files, setFiles, folders, setFolders } = React.useContext(StoreContext);
  const [loading, setLoading] = React.useState(true); // used for requesting files and folders

  React.useEffect(() => {
    if (!session || !session.user) return; // We don't need to handle anything because the user won't be able to even load this page if he isn't signed in
    setLoading(true);
    const controller = new AbortController();
    const storageService = new StorageService(session.user);
    const correctPath = preparePath(dirPath);

    Promise.all([
      storageService.getFiles(correctPath, undefined, {
        signal: controller.signal,
      }),
      storageService.getFolder(correctPath, undefined, {
        signal: controller.signal,
      }),
    ])
      .then(([getFiles, getFolders]) => {
        setFiles(getFiles ?? []);
        setFolders(getFolders ?? []);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [dirPath]);

  return (
    <StorageLayout>
      {loading ? (
        <Box sx={{ mt: 8 }}>
          <Spinner />
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 2 }}>
            <FolderWrapper folders={folders} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <FileWrapper files={files} />
          </Box>
        </>
      )}
    </StorageLayout>
  );
};

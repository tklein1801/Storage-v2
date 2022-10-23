import * as React from 'react';
import {
  Grid,
  GridProps,
  Box,
  Snackbar,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import type { Bucket } from '@supabase/storage-js';
import { SearchInput } from '../components/search.component';
import { Breadcrumb } from '../components/breadcrumb.component';
import { FilePreview } from '../components/file.component';
import { ContextMenuContext } from '../context/context-menu.context';
import { ContextMenu } from '../components/context-menu.component';
import { StoreContext } from '../context/store.context';
import { StorageService } from '../service/storage.service';
import { ContextMenuTarget } from '../types/context-menu.interface';
import { RenameDrawer } from '../components/forms/rename-drawer.component';
import { getFileExtensionFromFile, getPathFromFile } from '../utils/file.utils';
import { AuthContext } from '../context/auth.context';
import type { IFile } from '../types/store.interface';
import { Dropzone } from '../components/dropzone.component';
import { getPublicFileUrl } from '../constants/getPublicFileUrl';
import { SnackbarContext } from '../context/snackbar.context';
import { preparePath } from '../utils/path.utils';

export const StorageLayout: React.FC<React.PropsWithChildren<GridProps>> = (props) => {
  const { session } = React.useContext(AuthContext);
  const { state, dispatch } = React.useContext(ContextMenuContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { setFiles, setFilePreview, globalDirPath, setGlobalDirPath } =
    React.useContext(StoreContext);
  const [renameDetails, setRenameDetails] = React.useState<{
    show: boolean;
    target: ContextMenuTarget;
  }>({ show: false, target: null });
  const [uploadNotification, setUploadNotification] = React.useState({
    show: false,
    message: 'Files are uploading',
  });
  const storageService = React.useMemo(() => new StorageService(session!.user!), [session]);

  function handleOnClick() {
    if (state.show) dispatch({ type: 'CLOSE' });
  }

  function handleOnContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    // FIXME: Will always get called event if we're interacting on a file or folder.
    // Therefore we can't update any state bcause then interactions on files or folders won't work properly
    // This can be prevented using event.stopPropagination();
  }

  function handleFileUpload(files: FileList) {
    try {
      if (!files) return;
      if (!session || !session.user) throw new Error('You have to be signed in');
      setUploadNotification({
        show: true,
        message: files.length > 1 ? 'Files are uploading' : 'File is uploading',
      });

      const filesToUpload = Array.from(files);
      const uploadingFiles = filesToUpload.map((file) =>
        storageService.upload(file, globalDirPath + file.name)
      );

      Promise.all(uploadingFiles)
        .then((uploadResults) => {
          setUploadNotification({ show: false, message: '' });
          const uploadedFiles = uploadResults.map(({ Key }) => {
            const splittedKey = Key.split('/');
            const fileName = splittedKey[splittedKey.length - 1];
            return {
              id: splittedKey[0],
              name: fileName,
              path: globalDirPath + fileName,
            };
          });
          // const failedUploads = filesToUpload.filter((file) => {
          //   const wasUploaded = uploadedFiles.some((uf) => uf.name === file.name);
          //   if (!wasUploaded) return file;
          // })

          setFiles((prev) => {
            return [
              ...uploadedFiles
                .filter((file) => filesToUpload.some((ftu) => ftu.name === file.name)) // filter for failed uploads
                .map((file) => {
                  const { size, type } = filesToUpload.find((ftu) => ftu.name === file.name)!; // if this would be undefined this file wouldn't be here bcause it wouldn't be uploaded
                  const fileObject: IFile = {
                    ...file,
                    signedUrl: getPublicFileUrl(session!.user!.id, file.path), // won't run till here if there is no session
                    bucket_id: session!.user!.id, // won't run till here if there is no session
                    owner: session!.user!.id, // won't run till here if there is no session
                    metadata: { size: size, mimetype: type },
                    buckets: {} as Bucket, // not required and therefore not provided
                    last_accessed_at: new Date().toString(),
                    updated_at: new Date().toString(),
                    created_at: new Date().toString(),
                  };
                  return fileObject;
                }),
              ...prev,
            ];
          });
          showSnackbar({
            message:
              uploadedFiles.length === filesToUpload.length
                ? 'All files were uploaded'
                : `${uploadedFiles.length} / ${filesToUpload.length} were uploaded`,
          });
        })
        .catch((error) => {
          setUploadNotification({ show: false, message: '' });
          showSnackbar({
            message: 'File upload failed',
            action: <Button onClick={() => handleFileUpload(files)}>Retry</Button>,
          });

          console.log(error);
        });
    } catch (error) {
      setUploadNotification({ show: false, message: '' });
      showSnackbar({
        message: `Couldn't upload the ${files.length > 1 ? 'files' : 'file'}`,
        action: <Button onClick={() => handleFileUpload(files)}>Retry</Button>,
      });
      console.error(error);
    }
  }

  const contextMenuHandler = {
    onOpen: (file: ContextMenuTarget) => {
      try {
        if (!file) throw new Error('No file provided');
        switch (file.type) {
          case 'FILE':
            if (!session || !session.user) return;
            // it's safe to use an @ts-comment because it will be an type of IFile which contains this property
            const castedFile = file.target as IFile;
            setFilePreview(castedFile.signedUrl ?? '');
            break;

          case 'FOLDER':
            setGlobalDirPath((prev) => preparePath(prev + state.target?.target.name));
            break;
        }
        dispatch({ type: 'CLOSE' });
      } catch (error) {
        showSnackbar({
          message: "Couldn't open the file",
          action: <Button onClick={() => contextMenuHandler.onOpen(file)}>Retry</Button>,
        });
        console.error(error);
      }
    },
    onShare: (file: ContextMenuTarget) => {
      try {
        if (!file) throw new Error('No file provided');
        if (!file.target.path) throw new Error('No file path provided');
        storageService
          .createSignedUrl(file.target.path)
          .then((value) => {
            navigator.clipboard.writeText(value.signedURL);
            showSnackbar({ message: 'Signed URL has been placed on the clipboard' });
          })
          .catch((error) => {
            showSnackbar({ message: 'Signed URL could not be created' });
            console.error(error);
          })
          .finally(() => dispatch({ type: 'CLOSE' }));
      } catch (error) {
        showSnackbar({
          message: "Couldn't share the file",
          action: <Button onClick={() => contextMenuHandler.onShare(file)}>Retry</Button>,
        });
        console.error(error);
      }
    },
    onRename: (file: ContextMenuTarget) => {
      try {
        if (!file) throw new Error('No file provided');
        setRenameDetails({ show: true, target: file });
      } catch (error) {
        showSnackbar({
          message: "Couldn't rename the file",
          action: <Button onClick={() => contextMenuHandler.onRename(file)}>Retry</Button>,
        });
        console.error(error);
      }
    },
    onDownload: (file: ContextMenuTarget) => {
      try {
        if (!file) throw new Error('No file provided');
        if (file.type !== 'FILE') throw new Error('You can only download files at the moment');
        storageService
          .download(file.target as IFile)
          .then(() => showSnackbar({ message: `Download started` }))
          .catch((error) => {
            showSnackbar({
              message: 'Download failed',
              action: <Button onClick={() => contextMenuHandler.onDownload(file)}>Retry</Button>,
            });
            console.error(error);
          });
      } catch (error) {
        showSnackbar({
          message: "Couldn't download the file",
          action: <Button onClick={() => contextMenuHandler.onDownload(file)}>Retry</Button>,
        });
        console.log(error);
      }
    },
    onDelete: (file: ContextMenuTarget) => {
      {
        try {
          if (!file) throw new Error('No file provided');
          if (!file.target.path) throw new Error('No file path provided');
          if (file.type !== 'FILE') throw new Error('You can only delete files at the moment');
          storageService
            .delete([file.target.path])
            .then((result) => {
              const deletedFile = result[0];
              if (!deletedFile) throw new Error('No file got deleted');
              // TODO: Measure if it's faster to requets data from api instead of client-side processing
              setFiles((prev) => prev.filter((file) => file.path !== deletedFile.name));
              showSnackbar({ message: `File '${deletedFile.name}' deleted` });
            })
            .catch((error) => {
              showSnackbar({
                message: 'File deletion failed',
                action: <Button onClick={() => contextMenuHandler.onDelete(file)}>Retry</Button>,
              });
              console.error(error);
            });
        } catch (error) {
          showSnackbar({
            message: "Couldn't delete the file",
            action: <Button onClick={() => contextMenuHandler.onDelete(file)}>Retry</Button>,
          });
          console.error(error);
        }
      }
    },
  };

  const renameDrawerHandler = {
    onSubmit: (
      event: React.FormEvent<HTMLFormElement>,
      [newName, file]: [string, ContextMenuTarget]
    ) => {
      try {
        event.preventDefault();
        if (!file) throw new Error('There is no provided file');
        if (!file.target.path) throw new Error('No file-path provided');
        const splittedFilePath = getPathFromFile(file.target);
        const filePath =
          splittedFilePath.length >= 1 && splittedFilePath[0].length > 1
            ? splittedFilePath.join('/') + '/'
            : '';
        const fileExtension = getFileExtensionFromFile(file.type, file.target);
        storageService
          .move(
            file.target.path,
            file.type === 'FOLDER'
              ? filePath + newName /* only add path to folder */
              : filePath + newName + '.' + fileExtension /* add path and extension */
          )
          .then((result) => {
            setFiles((prev) =>
              prev.map((item) => {
                // FIXME: Prevent mapping the whole array when we could have already updated our item
                // Instead we wanna return the original array from there on and just copy paste it
                if (item.path === file.target.path) {
                  return {
                    ...item,
                    name: newName + '.' + fileExtension,
                    path: filePath + newName + '.' + fileExtension,
                  };
                } else return item;
              })
            );
            setRenameDetails({ show: false, target: null });
            showSnackbar({ message: `File '${file.target.name}' renamed` });
          })
          .catch((error) => {
            showSnackbar({
              message: `Renaming the file '${file.target.name}' failed`,
              action: (
                <Button onClick={() => renameDrawerHandler.onSubmit(event, [newName, file])}>
                  Retry
                </Button>
              ),
            });
            console.error(error);
          });
      } catch (error) {
        showSnackbar({
          message: "Couldn't rename the file",
          action: (
            <Button onClick={() => renameDrawerHandler.onSubmit(event, [newName, file])}>
              Retry
            </Button>
          ),
        });
        console.error(error);
      }
    },
    onClose: () => {
      setRenameDetails({ show: false, target: null });
    },
  };

  return (
    <Grid
      container
      spacing={3}
      sx={{ zIndex: 200 }}
      onContextMenu={handleOnContextMenu}
      onClick={handleOnClick}
      {...props}
    >
      <Grid item xs={12}>
        <Dropzone onUpload={handleFileUpload}>
          <Breadcrumb sx={{ mb: 2 }} />
          <Box
            sx={{
              position: 'sticky',
              top: (theme) => `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(2)})`,
              backgroundColor: (theme) => theme.palette.background.default,
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            }}
          >
            <SearchInput onUpload={handleFileUpload} />
          </Box>
          {props.children}
          <FilePreview />
          <ContextMenu {...contextMenuHandler} />
          <RenameDrawer {...renameDetails} {...renameDrawerHandler} />
          <Snackbar
            sx={{
              '& .MuiSnackbarContent-root': {
                backgroundColor: (theme) => theme.palette.background.default,
                color: (theme) => theme.palette.text.primary,
              },
            }}
            open={uploadNotification.show}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={
              <Box display="flex" alignItems="center">
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography>{uploadNotification.message}</Typography>
              </Box>
            }
          />
        </Dropzone>
      </Grid>
    </Grid>
  );
};

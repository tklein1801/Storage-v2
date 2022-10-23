import * as React from 'react';
import { SxProps, Theme, Typography, Box, Grid, Button } from '@mui/material';
import { InsertDriveFile as FileIcon } from '@mui/icons-material';
import type { IFile } from '../types/store.interface';
import Card from './card.component';
import { Image } from './image.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { StoreContext } from '../context/store.context';
import { ContextMenuContext } from '../context/context-menu.context';

export interface IFileWrapperProps {
  sx?: SxProps<Theme>;
  files: IFile[];
}

export const FileWrapper: React.FC<IFileWrapperProps> = ({ sx, files }) => {
  if (files.length < 1) return null;
  return (
    <Box sx={sx}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Files ({files.length})
      </Typography>
      <Grid container spacing={2}>
        {files.map((file, index) => (
          <Grid key={index + file.name} item xs={6} md={3} lg={3} xl={2}>
            <File file={file} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const File: React.FC<{ file: IFile; sx?: SxProps<Theme> }> = ({ file, sx }) => {
  const { dispatch } = React.useContext(ContextMenuContext);
  const { setFilePreview } = React.useContext(StoreContext);

  function handleOnClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // TODO: Check if we ever receive an null value
    setFilePreview(file.signedUrl ?? '');
  }

  function handleOnContextMenu(
    event: React.MouseEvent<HTMLDivElement | HTMLImageElement, MouseEvent>
  ) {
    event.preventDefault();
    dispatch({
      type: 'OPEN',
      position: { x: event.clientX, y: event.clientY },
      target: { type: 'FILE', target: file },
    });
  }

  return (
    <Card
      sx={{
        transition: '100ms all',
        p: 1,
        border: '2px solid transparent',
        ':hover': {
          cursor: 'pointer',
          // borderColor: (theme) => theme.palette.action.hover,
          borderColor: (theme) => theme.palette.primary.main,
        },
        ...sx,
      }}
    >
      <Card.Header>
        {
          // @ts-expect-error
          file.metadata.mimetype &&
          // @ts-expect-error
          file.metadata.mimetype!.includes('image') ? (
            <Image
              // TODO: Check if we ever receive an null value
              src={file.signedUrl ?? ''}
              alt={file.name}
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                objectPosition: 'center',
                aspectRatio: '16/9',
                borderRadius: (theme) => `${Number(theme.shape.borderRadius) * 0.75}px`,
              }}
              loading="lazy"
              onClick={handleOnClick}
              onContextMenu={handleOnContextMenu}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 'auto',
                aspectRatio: '16/9',
                backgroundColor: (theme) => theme.palette.action.disabled,
                borderRadius: (theme) => `${Number(theme.shape.borderRadius) * 0.75}px`,
              }}
              onContextMenu={handleOnContextMenu}
            >
              <FileIcon
                sx={{
                  fontSize: { sx: '3rem', md: '4rem' },
                }}
              />
            </Box>
          )
        }
      </Card.Header>
      <Card.Body sx={{ mt: 1 }}>
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 'bolder',
          }}
        >
          {file.name}
        </Typography>
      </Card.Body>
    </Card>
  );
};

export const FilePreview = () => {
  const screenSize = useScreenSize();
  const { filePreview, setFilePreview } = React.useContext(StoreContext);

  function handleOnClose(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>) {
    setFilePreview(null);
  }

  if (!filePreview) return null;
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0,0, 0.3)',
      }}
      onClick={handleOnClose}
    >
      {screenSize === 'small' && (
        <Button
          variant="contained"
          sx={{
            display: { sx: 'unset', md: 'none' },
            position: 'absolute',
            bottom: (theme) => theme.spacing(2),
            width: (theme) => `calc(100% - ${theme.spacing(4)})`,
          }}
          onClick={handleOnClose}
        >
          Schließen
        </Button>
      )}

      <Box
        sx={{
          aspectRatio: '16/9',
          display: 'flex',
          width: (theme) => ({
            xs: `calc(100% - ${theme.spacing(4)})`,
            md: 'auto',
          }),
          height: { xs: '50%', md: '60%' },
        }}
      >
        <Image
          src={filePreview}
          alt={filePreview}
          sx={{ maxWidth: '100%', mx: 'auto', objectFit: 'contain' }}
          onClick={(event) => event.stopPropagation()}
        />
      </Box>
    </Box>
  );
};

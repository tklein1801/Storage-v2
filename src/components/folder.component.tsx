import * as React from 'react';
import { styled, SxProps, Theme, Paper, Typography, Box, Grid } from '@mui/material';
import type { IFolder } from '../types/store.interface';
import { StoreContext } from '../context/store.context';
import { ContextMenuContext } from '../context/context-menu.context';
import { preparePath } from '../utils/path.utils';

export const FolderBox = styled(Paper)(({ theme }) => ({
  transition: '100ms all',
  padding: '0.5rem 1rem',
  border: '2px solid transparent',
  ':hover': {
    cursor: 'pointer',
    // borderColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },
}));

export interface IFolderWrapperProps {
  sx?: SxProps<Theme>;
  folders: IFolder[];
}

export const FolderWrapper: React.FC<IFolderWrapperProps> = ({ sx, folders }) => {
  if (folders.length < 1) return null;
  return (
    <Box sx={sx}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Folder ({folders.length})
      </Typography>
      <Grid container spacing={2}>
        {folders.map((folder, index) => (
          <Grid key={index + folder.name} item xs={6} md={3} lg={3} xl={2}>
            <FolderLink folder={folder} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const FolderLink: React.FC<{ folder: IFolder; sx?: SxProps<Theme> }> = ({ folder, sx }) => {
  const { dispatch } = React.useContext(ContextMenuContext);
  const { setGlobalDirPath } = React.useContext(StoreContext);

  function handleOnClick() {
    setGlobalDirPath((prev) => preparePath(prev + folder.name));
  }

  function handleOnContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    dispatch({
      type: 'OPEN',
      position: { x: event.clientX, y: event.clientY },
      target: { type: 'FOLDER', target: folder },
    });
  }

  return (
    <FolderBox
      sx={{
        zIndex: 210,
        ...sx,
      }}
      onClick={handleOnClick}
      onContextMenu={handleOnContextMenu}
    >
      <Typography>{folder.name}</Typography>
    </FolderBox>
  );
};

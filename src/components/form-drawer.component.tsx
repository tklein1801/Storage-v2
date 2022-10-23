import * as React from 'react';
import { Drawer, Box, Typography, IconButton, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { drawerWidth } from '../theme/default.theme';

export interface IFormDrawerProps extends React.PropsWithChildren {
  open: boolean;
  heading: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  closeLabel?: string;
  saveLabel?: string;
  dismissOnBackdropClick?: boolean;
}

export const FormDrawer: React.FC<IFormDrawerProps> = ({
  open,
  heading,
  onClose,
  onSubmit,
  closeLabel = 'Close',
  saveLabel = 'Save',
  dismissOnBackdropClick,
  children,
}) => {
  const screenSize = useScreenSize();
  return (
    <Drawer
      anchor={screenSize === 'small' ? 'bottom' : 'right'}
      open={open}
      onClose={(ev, reason) => reason === 'backdropClick' && dismissOnBackdropClick && onClose()}
      PaperProps={{
        elevation: 0,
        sx: {
          boxSizing: 'border-box',
          width: { xs: 'unset', md: drawerWidth * 2 },
          margin: { xs: 1, md: 0 },
          borderRadius: (theme) => ({
            xs: `${theme.shape.borderRadius}px`,
            md: 0,
          }),
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 0,
        }}
      >
        <Typography fontWeight="bold">{heading}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
        }}
      >
        <Box sx={{ py: 1, px: 2 }}>{children}</Box>
        <Box
          sx={{
            mt: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
              pt: 0,
            }}
          >
            <Button onClick={onClose} sx={{ mr: 1 }}>
              {closeLabel}
            </Button>
            <Button type="submit" variant="contained">
              {saveLabel}
            </Button>
          </Box>
        </Box>
      </form>
    </Drawer>
  );
};

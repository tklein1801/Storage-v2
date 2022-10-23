import * as React from 'react';
import { darken, Snackbar } from '@mui/material';
import type {
  ISnackbarContext,
  IShowSnackbarProps,
  ISnackbarProps,
} from '../types/snackbar.interface';

export const SnackbarContext = React.createContext({} as ISnackbarContext);

export const SnackbarProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [snackPack, setSnackPack] = React.useState<readonly ISnackbarProps[]>([]);
  const [open, setOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = React.useState<ISnackbarProps | undefined>(undefined);

  const showSnackbar = (props: IShowSnackbarProps) => {
    setSnackPack((prev) => [
      ...prev,
      { message: props.message, action: props.action, key: new Date().getTime() },
    ]);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false); // Close an active snack when a new one is added
    }
  }, [snackPack, messageInfo, open]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: (theme) => darken(theme.palette.background.default, 0.4),
            color: (theme) => theme.palette.primary.contrastText,
          },
        }}
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        message={messageInfo ? messageInfo.message : undefined}
        action={messageInfo ? messageInfo.action : undefined}
      />
    </SnackbarContext.Provider>
  );
};

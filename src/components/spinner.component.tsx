import * as React from 'react';
import { SxProps, Theme, Box, CircularProgress } from '@mui/material';

export interface ISpinnerProps {
  sx?: {
    box?: SxProps<Theme>;
    spinner?: SxProps<Theme>;
  };
}

export const Spinner: React.FC<ISpinnerProps> = ({ sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx?.box,
      }}
    >
      <CircularProgress sx={sx?.spinner} />
    </Box>
  );
};

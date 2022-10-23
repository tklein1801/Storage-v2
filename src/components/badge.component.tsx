import { styled, Chip } from '@mui/material';

export const Badge = styled(Chip)(({ theme }) => ({
  display: 'unset',
  height: 'max-content',
  borderRadius: `${Number(theme.shape.borderRadius) / 2}px`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '.MuiChip-label': {
    padding: '1.2rem .5rem',
  },
}));

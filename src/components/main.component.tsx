import { Box, Container, styled } from '@mui/material';

export const Main = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'auto',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const MainContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  margin: '2rem auto',
}));

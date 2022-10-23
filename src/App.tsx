import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Alert, AlertTitle, Box, Button, Link, Typography } from '@mui/material';
import { Navbar } from './components/navbar.component';
import { Copyright } from './components/copyright.component';
import { ProtectedRoute } from './components/protected.component';
import { Storage } from './routes/storage.route';
import { SetupStorage } from './routes/setup-storage.component';
import { SignIn } from './routes/sign-in.component';
import { SignUp } from './routes/sign-up.component';
import { Main, MainContainer } from './components/main.component';
import { StoreContext } from './context/store.context';
import { ContextMenuProvider } from './context/context-menu.context';
import Card from './components/card.component';
import CFG from './config.json';

export const App: React.FC = () => {
  const { globalDirPath } = React.useContext(StoreContext);
  const [completeSetup, setCompleteSetup] = React.useState(true);

  React.useEffect(() => {
    CFG.environment.required.forEach((variable) => {
      if (!process.env[variable]) setCompleteSetup(false);
    });
  }, []);

  if (!completeSetup) {
    return (
      <Main
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: { xs: '90%', md: '25%' }, minWidth: '250px' }}>
          <Card.Header sx={{ mb: 1 }}>
            <Card.Title>Incomplete setup</Card.Title>
          </Card.Header>
          <Card.Body>
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              You're application setup is incomplete, because you're missing some{' '}
              <strong>required environment variables</strong>!<br /> For further information have a
              look into your <code>.env</code>-file and the{' '}
              <Link href="https://github.com/tklein1801/Storage-v2/#setup">setup-guide</Link>.<br />
              <strong>
                Don't forget to restart the application after changing the environment variables.
              </strong>
            </Alert>
          </Card.Body>
          <Card.Footer sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </Card.Footer>
        </Card>
      </Main>
    );
  }
  return (
    <BrowserRouter>
      <Main>
        <Navbar />
        <MainContainer maxWidth="xl">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ContextMenuProvider>
                    <Storage dirPath={globalDirPath} />
                  </ContextMenuProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup-storage"
              element={
                <ProtectedRoute>
                  <SetupStorage />
                </ProtectedRoute>
              }
            />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="*" element={<h1>Page not Found</h1>} />
          </Routes>
        </MainContainer>
        <Box
          component="div"
          sx={{
            mt: 'auto',
          }}
        >
          <Copyright />
        </Box>
      </Main>
    </BrowserRouter>
  );
};

import * as React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { User } from '@supabase/supabase-js';
import Card from '../components/card.component';
import { Spinner } from '../components/spinner.component';
import { AuthContext } from '../context/auth.context';
import { StorageService } from '../service/storage.service';
import { useNavigate } from 'react-router-dom';
import { SnackbarContext } from '../context/snackbar.context';

export const SetupStorage = () => {
  const navigate = useNavigate();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [shouldCreateBucket, setShouldCreateBucket] = React.useState(false);

  function createBucket(user: User) {
    StorageService.create(user)
      .then(() => {
        navigate('/');
        showSnackbar({ message: 'The setup is complete, you will now be redirected' });
      })
      .catch((error) => {
        console.error(error);
        showSnackbar({
          message: 'The setup failed',
          action: <Button onClick={() => createBucket(user)}>Retry</Button>,
        });
      });
  }

  React.useEffect(() => {
    if (session && session.user) {
      StorageService.getBucket(session.user)
        .then(() => {
          navigate('/'); // The user does already have an bucket so there is no need to register a new one..
        })
        .catch((error) => {
          console.error(error);
          if (error.message === 'The resource was not found') {
            setShouldCreateBucket(true);
            createBucket(session.user!);
          }
        });
    }
  }, [session]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box>
        <Card>
          <Spinner />
          {shouldCreateBucket && (
            <>
              <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
                Creating your bucket...
              </Typography>
              <Typography sx={{ textAlign: 'center' }}>This can take up to 60 seconds!</Typography>
            </>
          )}
        </Card>
      </Box>
    </Box>
  );
};

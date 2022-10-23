import * as React from 'react';
import {
  Box,
  FormControl,
  Grid,
  TextField,
  Typography,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';

export const SignUp = () => {
  const navigate = useNavigate();
  const { setSession } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const values = Object.keys(form);
        if (!values.includes('email')) throw new Error('Provide an email');
        if (!values.includes('password')) throw new Error('Provide an password');

        const { session, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        if (!session) throw new Error('No session created');
        if (!session.user)
          throw new Error("Session doesn't contian an user! Verify your account before signing in");
        showSnackbar({ message: 'Sign up successfull' });
        setSession(session);
        navigate('/setup-storage');
      } catch (error) {
        console.error(error);
        showSnackbar({
          // @ts-expect-error
          message: typeof error === 'object' ? error.message || 'Sign in failed' : error,
          action: <Button onClick={() => formHandler.formSubmit(event)}>Retry</Button>,
        });
      }
    },
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} sm={6} lg={4}>
        <Card
          sx={{
            py: 3,
            px: 4,
          }}
        >
          <Typography textAlign="center" variant="h4" fontWeight={600}>
            Sign Up
          </Typography>

          <form onSubmit={formHandler.formSubmit}>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                sx={{
                  mt: 3,
                }}
                variant="outlined"
                type="email"
                label="E-Mail"
                name="email"
                onChange={formHandler.inputChange}
              />

              <FormControl
                variant="outlined"
                sx={{
                  mt: 3,
                }}
              >
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={formHandler.inputChange}
                  label="Password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Register
              </Button>
            </Box>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
};

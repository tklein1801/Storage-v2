import { Box, Link, Typography } from '@mui/material';

export const Copyright = (props: any) => {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <Link color="inherit" href="https://tklein.it">
          Thorben Klein
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};

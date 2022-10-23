import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { NavbarLinks as pages } from '../constants/navbar-links.constant';
import { Badge } from './badge.component';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';

const brand = 'Storage';

export const Navbar = () => {
  const { session } = React.useContext(AuthContext);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'rgba(200, 200, 150, .1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {brand}
            </Typography>
            <Badge label="v2" sx={{ ml: 1 }} />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={() => {
                    window.location.href = page.link;
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}

              {session && (
                <MenuItem
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) console.log(error);
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">Sign out</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {brand}
            </Typography>
            <Badge label="v2" sx={{ ml: 1 }} />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto' }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => {
                  window.location.href = page.link;
                  handleCloseNavMenu();
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}

            {session && (
              <Button
                onClick={async () => {
                  const { error } = await supabase.auth.signOut();
                  if (error) console.log(error);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Sign out
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              color="inherit"
              sx={{ ml: 'auto' }}
              onClick={() => {
                window.location.href = 'https://github.com/tklein1801/Storage-v2';
              }}
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

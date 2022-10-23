import * as React from 'react';
import { styled, Breadcrumbs, Link, Typography, SxProps } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { StoreContext } from '../context/store.context';
import { Theme } from '@mui/system';
import { preparePath } from '../utils/path.utils';

const BreadcrumbText = styled(Typography)(({ theme }) => ({
  transition: '100ms all',
  display: 'flex',
  padding: '.3rem .6rem',
  backgroundColor: theme.palette.action.selected,
  borderRadius: `${theme.shape.borderRadius}px`,
  color: 'text.primary',
  ':hover': {
    cursor: 'default',
  },
}));

const BreadcrumbLink = styled(Link)(({ theme }) => ({
  transition: '100ms all',
  display: 'flex',
  padding: '.3rem .6rem',
  borderRadius: `${theme.shape.borderRadius}px`,
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: theme.palette.action.hover,
  },
}));

export const Breadcrumb: React.FC<{ sx?: SxProps<Theme> }> = ({ sx }) => {
  const { globalDirPath, setGlobalDirPath } = React.useContext(StoreContext);

  const links = React.useMemo(() => {
    const splittedPath = globalDirPath.split('/').filter((path) => path.length > 0);

    if (splittedPath.length === 0) {
      return [<BreadcrumbText key="Home">Home</BreadcrumbText>];
    } else {
      return [
        <BreadcrumbLink key="Home" onClick={(event) => handleOnClick(event, '')}>
          Home
        </BreadcrumbLink>,

        splittedPath.map((path, index, list) => {
          const fullPath = splittedPath.slice(0, index + 1).join('/');
          return index === list.length - 1 ? (
            <BreadcrumbText aria-label={preparePath(fullPath)} key={path}>
              {path}
            </BreadcrumbText>
          ) : (
            <BreadcrumbLink
              key={path}
              aria-label={preparePath(fullPath)}
              onClick={(event) => handleOnClick(event, preparePath(fullPath))}
            >
              {path}
            </BreadcrumbLink>
          );
        }),
      ];
    }
  }, [globalDirPath]);

  function handleOnClick(
    event:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | React.MouseEvent<HTMLSpanElement, MouseEvent>,
    path: string
  ) {
    event.preventDefault();
    setGlobalDirPath(path);
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={sx}>
      {links}
    </Breadcrumbs>
  );
};

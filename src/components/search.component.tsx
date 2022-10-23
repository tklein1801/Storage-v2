import * as React from 'react';
import {
  styled,
  alpha,
  InputBase,
  SxProps,
  Theme,
  InputAdornment,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  InsertDriveFile as FileIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import debounce from 'lodash.debounce';
import { AuthContext } from '../context/auth.context';
import { supabase } from '../supabase';
import type { ContextMenuTargetType } from '../types/context-menu.interface';
import type {
  SearchResult,
  SearchResults,
  SearchReducerAction,
  SearchState,
} from '../types/search.interface';
import { StoreContext } from '../context/store.context';
import { getPublicFileUrl } from '../constants/getPublicFileUrl';
import { preparePath } from '../utils/path.utils';

export const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  transition: '100ms all',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  border: '2px solid transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    borderColor: theme.palette.primary.main,
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: '100%',
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

export const SearchResultContainer = styled(Box, { shouldForwardProp: (prop) => prop !== 'show' })<{
  show: boolean;
}>(({ theme, show }) => ({
  zIndex: 400,
  position: 'absolute',
  display: show ? 'unset' : 'none',
  width: '100%',
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const SearchResultItemContainer = styled(Box)(({ theme }) => ({
  transition: '100ms all',
  display: 'flex',
  padding: '.25rem .5rem',
  borderRadius: `${Number(theme.shape.borderRadius) * 0.75}px`,
}));

export const SearchResultItem: React.FC<{ type: ContextMenuTargetType; result: SearchResult }> = ({
  type,
  result,
}) => {
  const { session } = React.useContext(AuthContext);
  const { globalDirPath, setGlobalDirPath, setFilePreview } = React.useContext(StoreContext);
  return (
    <SearchResultItemContainer
      sx={{
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: (theme) => theme.palette.action.hover,
        },
      }}
      onClick={() => {
        if (type === 'FOLDER') {
          if (result.path !== globalDirPath) setGlobalDirPath(result.path);
        } else {
          const path = preparePath(result.path); // get home directory of file (without file-name)
          if (path !== globalDirPath) setGlobalDirPath(path);
          if (result.metadata.mimetype.includes('image')) {
            // Code wouldn't run if the user
            setFilePreview(getPublicFileUrl(session!.user!.id, result.path));
          }
        }
      }}
    >
      {type === 'FOLDER' ? (
        <FolderIcon sx={{ marginRight: 1 }} />
      ) : (
        <FileIcon sx={{ marginRight: 1 }} />
      )}
      {result.name}
    </SearchResultItemContainer>
  );
};

const INTIAL_SEARCH_STATE: SearchState = {
  show: false,
  keyword: '',
  results: [],
};

function searchReducer(state: SearchState, action: SearchReducerAction) {
  switch (action.type) {
    case 'SHOW_RESULTS':
      return { ...state, show: true, keyword: action.keyword, results: action.results };

    case 'SHOW_NO_RESULTS_MSG':
      return { ...state, show: true, keyword: action.keyword, results: [] };

    case 'CLOSE':
      return { ...state, show: false, keyword: '', results: [] };

    default:
      throw new Error('Trying to execute unknown action');
  }
}

export const SearchInput: React.FC<{
  label?: string;
  sx?: SxProps<Theme>;
  onUpload: (files: FileList) => void;
}> = ({ label = 'Search...', sx, onUpload }) => {
  const controller = new AbortController();
  const { session } = React.useContext(AuthContext);
  const uploadInputRef = React.createRef<HTMLInputElement>();
  const [searchResults, dispatchSearchResults] = React.useReducer(
    searchReducer,
    INTIAL_SEARCH_STATE
  );

  async function handleOnSearch(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    try {
      const keyword = event.target.value;
      if (!session || !session.user || keyword.length < 1) {
        return dispatchSearchResults({ type: 'CLOSE' });
      }
      const { data, error } = await supabase.rpc<SearchResults>('search', {
        keyword: keyword,
        limit_by: 5,
      });
      if (error) throw error;
      if (!data) {
        return dispatchSearchResults({ type: 'SHOW_NO_RESULTS_MSG', keyword: keyword });
      } else {
        return dispatchSearchResults({
          type: 'SHOW_RESULTS',
          keyword: keyword,
          results: data as SearchResult[],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleUploadBtnClick() {
    uploadInputRef.current?.click();
  }

  React.useEffect(() => {
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Box>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder={label}
          inputProps={{ 'aria-label': 'search' }}
          onChange={debounce((event) => handleOnSearch(event), 200)}
          sx={sx}
          endAdornment={
            <InputAdornment position="end">
              <Button
                variant="contained"
                onClick={handleUploadBtnClick}
                size="small"
                sx={{
                  mr: 0.5,
                  borderRadius: (theme) => `${Number(theme.shape.borderRadius) * 0.75}px`,
                }}
              >
                Upload
              </Button>
            </InputAdornment>
          }
        />
        <input
          ref={uploadInputRef}
          type="file"
          hidden
          multiple
          onChange={({ target: { files } }) => {
            if (files) onUpload(files);
          }}
        />
      </Search>
      <SearchResultContainer show={searchResults.show}>
        {searchResults.results.length < 1 && (
          <SearchResultItemContainer onClick={() => dispatchSearchResults({ type: 'CLOSE' })}>
            <Typography>No results for '{searchResults.keyword}'</Typography>
          </SearchResultItemContainer>
        )}

        {searchResults.results.map((result) => (
          <Box key={result.id} onClick={() => dispatchSearchResults({ type: 'CLOSE' })}>
            <SearchResultItem type={result.type} result={result} />
          </Box>
        ))}
      </SearchResultContainer>
    </Box>
  );
};

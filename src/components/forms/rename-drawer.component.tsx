import * as React from 'react';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { FormDrawer } from '../form-drawer.component';
import type { ContextMenuTarget } from '../../types/context-menu.interface';
import { getFilenameFromFile, getFileExtensionFromFile } from '../../utils/file.utils';

export interface IRenameDrawerProps {
  show: boolean;
  target: ContextMenuTarget;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    /**
     * [`newFileName: string`, `file: ContextMenuTarget`]
     * The `newFileName` does not contain an file-extension
     */
    fileDetails: [string, ContextMenuTarget]
  ) => void;
  onClose: () => void;
}

export const RenameDrawer: React.FC<IRenameDrawerProps> = ({ show, target, onSubmit, onClose }) => {
  const [updated, setUpdated] = React.useState(target?.target.name ?? '');
  const [error, setError] = React.useState({ error: false, message: '' });
  const targetDetails: {
    name: string;
    extension: string;
    dirPath: string;
  } | null = React.useMemo(() => {
    if (!target || !target.target.path) return null;
    const fileName = getFilenameFromFile(target.target);
    const fileExtension = getFileExtensionFromFile(target.type, target.target);
    const splittedPath = target.target.path.split('/');
    return {
      name: fileName,
      // target.type === 'FILE'
      //   ? splittedFileName.slice(0, splittedFileName.length - 1).join('.')
      //   : target.target.name,
      extension: fileExtension, // splittedFileName[splittedFileName.length - 1],
      dirPath:
        splittedPath.length === 1
          ? ''
          : splittedPath.slice(0, splittedPath.length - 1).join('/') + '/', // we only want the directory path leading to the file
    };
  }, [target]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setUpdated(event.target.value);
  }

  React.useEffect(() => {
    return () => {
      setUpdated('');
      setError({ error: false, message: '' });
    };
  }, [target]);

  React.useEffect(() => {
    if (error.error) setError({ error: false, message: '' });
  }, [updated]);

  if (!target) return null;
  return (
    <FormDrawer
      heading="Rename"
      open={show}
      onSubmit={(event) => {
        event.preventDefault();

        if (updated.length === 0) {
          return setError({ error: true, message: 'Provide a new name' });
        }

        if (`${updated}.${targetDetails?.extension}` === target.target.name) {
          return setError({
            error: true,
            message: 'You have to change the name',
          });
        }

        onSubmit(event, [updated, target]);
      }}
      onClose={onClose}
      dismissOnBackdropClick
    >
      <FormControl variant="outlined" fullWidth error={error.error}>
        <InputLabel htmlFor="rename-object-name">Name</InputLabel>
        <OutlinedInput
          id="rename-object-name"
          label="Name"
          value={updated}
          onChange={handleInputChange}
          endAdornment={
            target.type === 'FILE' && (
              <InputAdornment position="end">{targetDetails?.extension}</InputAdornment>
            )
          }
        />
        {error.error && <FormHelperText error={true}>{error.message}</FormHelperText>}
      </FormControl>
    </FormDrawer>
  );
};

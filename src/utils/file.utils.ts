import type { ContextMenuTargetType } from '../types/context-menu.interface';
import type { IFile, IFolder } from '../types/store.interface';

/**
 * Returns only the file/folder-name from an `FileObject.name` without an file-extension
 */
export function getFilenameFromFile(object: IFile | IFolder) {
  const splittedFileName = object.name.split('.');
  return splittedFileName
    .slice(
      0,
      splittedFileName.length === 1
        ? 1
        : splittedFileName.length -
            1 /* -1 to exclude the file-extension (only if we have found a file-extension) */
    )
    .join('.');
}

export function getFileExtensionFromFile(type: ContextMenuTargetType, object: IFile | IFolder) {
  if (type === 'FOLDER') return '';
  const splittedName = object.name.split('.');
  return splittedName[splittedName.length - 1];
}

/**
 * Returns an list of strings containing the directory-path leading to the provided file/folder
 * If the provided file is sitting in the root-directory or the provided object doesn't contain an value for the `path`-property an array with an empty string will get returned
 */
export function getPathFromFile(object: IFile | IFolder) {
  if (!object.path) return [''];
  const splittedPath = object.path.split('/');
  return splittedPath.length <= 1 ? [''] : splittedPath.slice(0, splittedPath.length - 1); // we're removing the last item because it would be the file/folder-name
}

/**
 * Prepare paths to be compatible with the API means
 *  - / => ""
 *  - ./ => ""
 *  - add trailing / ./dir => dir/
 *  - will only lead to an directory and remove the file (if provided) ./dir/test.json => dir/
 */
export function preparePath(path: string) {
  let preparedPath = path;
  let splittedPath = preparedPath.split('/');
  if (splittedPath[splittedPath.length - 1].includes('.')) {
    splittedPath = splittedPath.slice(0, splittedPath.length - 1);
  }
  preparedPath = splittedPath.join('/');
  if (!preparedPath.endsWith('/')) preparedPath += '/';

  if (preparedPath.startsWith('/')) {
    if (preparedPath.length >= 1) {
      preparedPath = preparedPath.substring(1, preparedPath.length);
    } else preparedPath = '';
  }
  if (preparedPath.startsWith('./')) {
    if (preparedPath.length >= 2) {
      preparedPath = preparedPath.substring(2, preparedPath.length);
    } else preparedPath = '';
  }

  return preparedPath;
}

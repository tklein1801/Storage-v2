import type { User } from '@supabase/supabase-js';
import type { Bucket, SearchOptions, FileObject } from '@supabase/storage-js';
import type { FetchParameters } from '@supabase/storage-js/src/lib/fetch';
import { supabase } from '../supabase';
import type { IFile, IFolder } from '../types/store.interface';
import { getPublicFileUrl } from '../constants/getPublicFileUrl';

export class StorageService {
  private user: User;
  static usePublicBuckets: boolean = process.env.REACT_APP_PUBLIC_BUCKETS === 'true';

  constructor(user: User) {
    this.user = user;
  }

  static getBucket(user: User): Promise<Bucket> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage.getBucket(user.id);
      if (error) rej(error);
      if (!data) throw new Error('No bucket found');
      res(data);
    });
  }

  static create(user: User) {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage.createBucket(user.id, {
        public: this.usePublicBuckets,
      });
      if (error) rej(error);
      res(data);
    });
  }

  /**
   *
   * **Currently there is no folder upload provided**
   *
   *
   * Files are uploaded with `upsert: false` by default. This means there is no need to check if there is already an file named like on the provided path because in this case an error is thrown and the uplaod fails
   */
  upload(file: File, path: string): Promise<{ Key: string }> {
    return new Promise(async (res, rej) => {
      if (!this.isValidKey(path)) throw new Error(`Path '${path}' contains invalid characters`);
      const { data, error } = await supabase.storage.from(this.user.id).upload(path, file);
      if (error) rej(error);
      console.log(data);
      if (!data) throw new Error('No file got uploaded');
      res(data);
    });
  }

  // TODO: Write tests to check that only correct data gets returned
  /**
   * The lifetime of the signedUrls are by default 2-hours long. After that the link won't be longer alive and can't get used.
   */
  getFiles(
    path: string = '',
    searchOptions: SearchOptions = { sortBy: { column: 'updated_at', order: 'desc' } },
    fetchParameters?: FetchParameters
  ): Promise<IFile[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage
        .from(this.user.id)
        .list(path, searchOptions, fetchParameters);
      if (error) rej(error);
      if (data === null) res([]);
      if (data !== null) {
        const actualFiles = data
          .filter((file) => file.metadata !== null && file.name !== '.emptyFolderPlaceholder')
          .map((file) => ({ ...file, path: path + file.name }));
        if (actualFiles.length < 1) {
          res([]);
        } else {
          res(
            actualFiles.map((file) => ({
              ...file,
              path: path + file.name,
              signedUrl: getPublicFileUrl(this.user.id, file.path),
            }))
          );

          // const filesToSign = actualFiles;
          // Promise.all(filesToSign.map((file) => this.createSignedUrl(file.path)))
          //   .then((results) => {
          //     res(
          //       actualFiles.map((file, index) => ({
          //         ...file,
          //         path: path + file.name,
          //         signedUrl: results[index].signedURL,
          //       }))
          //     );
          //     console.log(results);
          //   })
          //   .catch((error) => rej(error));
          // const signedFileUrls = await this.createSignedUrls(
          //   actualFiles.map((file) => path + file.name),
          //   60 * 60 * 2
          // );
          // if (signedFileUrls.length !== actualFiles.length)
          //   throw new Error('Length of signed-urls and files are missmatching');
          // // This will only work without problems if Supabase returns an sorted list without any null values
          // res(
          //   actualFiles.map((file, index) => ({
          //     ...file,
          //     path: path + file.name,
          //     signedUrl: signedFileUrls[index].signedURL,
          //   }))
          // );
        }
      }
    });
  }

  // TODO: Write tests to check that only correct data gets returned
  getFolder(
    path: string = '',
    searchOptions: SearchOptions = { sortBy: { column: 'name', order: 'desc' } },
    fetchParameters?: FetchParameters
  ): Promise<IFolder[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage
        .from(this.user.id)
        .list(path, searchOptions, fetchParameters);
      if (error) rej(error);
      if (data !== null) {
        res(
          data
            .filter(
              (folder) => folder.metadata === null && folder.name !== '.emptyFolderPlaceholder'
            )
            .map((folder) => ({ ...folder, path: path + folder.name }))
        );
      } else res([]);
    });
  }

  /**
   * Because of Supabase you're currently not able to rename folders
   */
  move(old: string, updated: string): Promise<{ message: string }> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage.from(this.user.id).move(old, updated);
      if (error) rej(error);
      if (data === null) rej(new Error('No object updated'));
      res(data!);
    });
  }

  /**
   * @param expiresIn Time defined in seconds the URL will be valid
   */
  createSignedUrls(
    paths: string[],
    expiresIn: number = 60 * 60
  ): Promise<
    {
      error: string | null;
      path: string | null;
      signedURL: string;
    }[]
  > {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage
        .from(this.user.id)
        .createSignedUrls(paths, expiresIn);
      if (error) rej(error);
      if (data === null) rej(new Error('No object returned'));
      res(data!);
    });
  }

  /**
   * @param expiresIn (Default = 60 Minutes) Time defined in seconds the URL will be valid
   */
  createSignedUrl(
    path: string,
    expiresIn: number = 60 * 60
  ): Promise<{
    signedURL: string;
  }> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage
        .from(this.user.id)
        .createSignedUrl(path, expiresIn);
      if (error) rej(error);
      if (data === null) rej(new Error('No object returned'));
      res(data!);
    });
  }

  /**
   * Currently you're only able to delete files.
   * @todo // TODO: How to delete whole folders with files included
   */
  delete(paths: string[]): Promise<FileObject[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.storage.from(this.user.id).remove(paths);
      if (error) rej(error);
      if (data === null) rej(new Error('No files deleted'));
      res(data!);
    });
  }

  download(file: IFile): Promise<Blob> {
    return new Promise(async (res, rej) => {
      if (!file.path) rej(new Error('No path to file provided'));
      const { data, error } = await supabase.storage.from(this.user.id).download(file.path!);
      if (error) rej(error);
      if (data === null) rej(new Error('No object returned'));
      this.downloadFileToDevice(data!, file);
    });
  }

  /**
   * @author https://gist.github.com/jbutko/d7b992086634a94e84b6a3e526336da3
   */
  private downloadFileToDevice(file: Blob, fileDetails: IFile) {
    if (!(file instanceof Blob)) return;
    // @ts-expect-error
    if (!fileDetails.metadata || !fileDetails.metadata.mimetype) return;
    // @ts-expect-error
    const blob = new Blob([file], { type: fileDetails.metadata.mimetype });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileDetails.name;
    link.click();
  }

  /**
   * @author https://github.com/supabase/supabase/discussions/2480
   */
  isValidKey(key: string): boolean {
    // only allow s3 safe characters and characters which require special handling for now
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
    return /^(\w|\/|!|-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/.test(key);
  }
}

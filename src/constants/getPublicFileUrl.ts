export const getPublicFileUrl = (bucket: string, path: string) =>
  `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

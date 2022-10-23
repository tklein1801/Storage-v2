export interface IShowSnackbarProps {
  message: string;
  action?: React.ReactNode;
}

export interface ISnackbarProps extends IShowSnackbarProps {
  key: number;
}

export interface ISnackbarContext {
  showSnackbar: (props: IShowSnackbarProps) => void;
}

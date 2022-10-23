import type { IFile, IFolder } from './store.interface';

export type ContextMenuPosition = { x: number; y: number };

export type ContextMenuTargetType = 'FOLDER' | 'FILE';

export type ContextMenuTarget = {
  type: ContextMenuTargetType;
  target: IFile | IFolder;
} | null;

export type ContextMenuState = {
  show: boolean;
  position: ContextMenuPosition;
  target: ContextMenuTarget;
};

export type ContextMenuStateAction =
  | { type: 'OPEN'; position: ContextMenuPosition; target: ContextMenuTarget }
  | { type: 'CLOSE' };

export interface IContextMenuContext {
  state: ContextMenuState;
  dispatch: React.Dispatch<ContextMenuStateAction>;
}


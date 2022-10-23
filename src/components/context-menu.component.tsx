import * as React from 'react';
import { styled, Box, Button } from '@mui/material';
import { ContextMenuContext } from '../context/context-menu.context';
import type { ContextMenuTarget } from '../types/context-menu.interface';

export const ContextMenuWidth = 200;

export const ContextMenuContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'show' && prop !== 'pos',
})<{
  show: boolean;
  pos: any;
}>(({ theme, show, pos }) => ({
  zIndex: theme.zIndex.tooltip + 100,
  display: show ? 'block' : 'none',
  position: 'fixed',
  boxSize: 'border-box',
  top: `${pos.y}px`,
  left: `${pos.x}px`,
  width: `${ContextMenuWidth}px`,
  maxWidth: `${ContextMenuWidth}px`,
  padding: '0.5rem',
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[3],
  borderRadius: `${theme.shape.borderRadius}px`,
}));

export const ContextMenuItem = styled(Button)(() => ({
  width: '100%',
}));

export interface IContextMenuProps {
  onOpen?: (file: ContextMenuTarget) => void;
  onShare?: (file: ContextMenuTarget) => void;
  onRename?: (file: ContextMenuTarget) => void;
  onDownload?: (file: ContextMenuTarget) => void;
  onDelete?: (file: ContextMenuTarget) => void;
}

export const ContextMenu: React.FC<IContextMenuProps> = ({
  onOpen,
  onShare,
  onRename,
  onDownload,
  onDelete,
}) => {
  const { state } = React.useContext(ContextMenuContext);

  const calculatePosition = React.useMemo(() => {
    const maxWidth = window.innerWidth;
    const position = state.position;
    return {
      y: position.y,
      x:
        position.x + ContextMenuWidth > maxWidth
          ? maxWidth - ContextMenuWidth
          : position.x,
    };
  }, [state.position]);

  function handleOnOpen() {
    if (onOpen) onOpen(state.target);
  }

  function handleOnShare() {
    if (onShare) onShare(state.target);
  }

  function handleOnRename() {
    if (onRename) onRename(state.target);
  }

  function handleOnDownload() {
    if (onDownload) onDownload(state.target);
  }

  function handleOnDelete() {
    if (onDelete) onDelete(state.target);
  }

  return (
    <ContextMenuContainer show={state.show} pos={calculatePosition}>
      <ContextMenuItem
        onClick={handleOnOpen}
        disabled={
          !state.target ||
          (state.target.target.metadata &&
            // @ts-expect-error
            !state.target.target.metadata.mimetype.includes('image'))
        }
      >
        Open
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleOnShare}
        disabled={!state.target || !state.target.target.metadata}
      >
        Share
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleOnRename}
        disabled={!state.target || !state.target.target.metadata}
      >
        Rename
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleOnDownload}
        disabled={!state.target || !state.target.target.metadata}
      >
        Download
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleOnDelete}
        disabled={!state.target || !state.target.target.metadata}
      >
        Delete
      </ContextMenuItem>
    </ContextMenuContainer>
  );
};


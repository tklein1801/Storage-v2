import * as React from 'react';
import type {
  ContextMenuState,
  ContextMenuStateAction,
  IContextMenuContext,
} from '../types/context-menu.interface';

export const ContextMenuContext = React.createContext(
  {} as IContextMenuContext
);

const INITIAL_STATE: ContextMenuState = {
  show: false,
  position: { x: 0, y: 0 },
  target: null,
};

export const ContextMenuProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(contextMenuReducer, INITIAL_STATE);

  return (
    <ContextMenuContext.Provider value={{ state, dispatch }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

function contextMenuReducer(
  state: ContextMenuState,
  action: ContextMenuStateAction
): ContextMenuState {
  switch (action.type) {
    case 'OPEN':
      return {
        ...state,
        show: true,
        position: action.position,
        target: action.target,
      };

    case 'CLOSE':
      return { ...state, show: false, target: null };

    default:
      throw new Error('Trying to execute unknown action');
  }
}

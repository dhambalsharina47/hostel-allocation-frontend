import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = { toasts: [], refreshKey: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'REFRESH': // bump to tell pages that shared data changed
      return { ...state, refreshKey: state.refreshKey + 1 };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const notify = useCallback((message, kind = 'success') => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD_TOAST', toast: { id, message, kind } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500);
  }, []);

  const dismiss = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', id }), []);
  const refresh = useCallback(() => dispatch({ type: 'REFRESH' }), []);

  const value = useMemo(
    () => ({ toasts: state.toasts, refreshKey: state.refreshKey, notify, dismiss, refresh }),
    [state.toasts, state.refreshKey, notify, dismiss, refresh]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

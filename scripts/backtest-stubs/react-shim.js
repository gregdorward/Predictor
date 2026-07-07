export default function Stub() {
  return null;
}

export const Fragment = ({ children }) => children ?? null;

export function useState(initial) {
  return [initial, () => {}];
}

export function useEffect() {}

export function useMemo(factory) {
  return factory();
}

export function useCallback(fn) {
  return fn;
}

export function useRef(initial) {
  return { current: initial };
}

export function createElement(type, props, ...children) {
  return { type, props, children };
}

export const lazy = (factory) => factory;

export const Suspense = ({ children }) => children ?? null;

export function createContext(defaultValue) {
  return {
    Provider: ({ children }) => children ?? null,
    Consumer: ({ children }) => children(defaultValue),
  };
}

export function useContext() {
  return null;
}

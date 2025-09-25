import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Router {
  pathname: string;
  query: Record<string, string>;
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
}

export const useRouter = (): Router => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Array.from(params.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }, [location.search]);

  const push = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  const back = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    pathname: location.pathname,
    query,
    push,
    replace,
    back,
  };
};

export default useRouter;

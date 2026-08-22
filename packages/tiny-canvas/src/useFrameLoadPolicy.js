import { useCallback, useEffect, useState } from 'react';

const LOAD_STRATEGIES = new Set(['eager', 'interaction']);

export function resolveFrameLoadStrategy(loadStrategy, snapshot) {
  const resolvedStrategy =
    loadStrategy ??
    (typeof snapshot === 'string' && snapshot.trim()
      ? 'interaction'
      : 'eager');

  if (!LOAD_STRATEGIES.has(resolvedStrategy)) {
    throw new TypeError(
      `Frame loadStrategy must be "eager" or "interaction"; received "${resolvedStrategy}".`
    );
  }

  if (
    resolvedStrategy === 'interaction' &&
    (typeof snapshot !== 'string' || !snapshot.trim())
  ) {
    throw new TypeError(
      'Frame loadStrategy="interaction" requires a non-empty snapshot.'
    );
  }

  return resolvedStrategy;
}

export default function useFrameLoadPolicy({ loadStrategy, snapshot }) {
  const resolvedStrategy = resolveFrameLoadStrategy(loadStrategy, snapshot);
  const [admitted, setAdmitted] = useState(
    () => resolvedStrategy === 'eager'
  );

  useEffect(() => {
    if (resolvedStrategy === 'eager') {
      setAdmitted(true);
    }
  }, [resolvedStrategy]);

  const activate = useCallback(() => {
    setAdmitted(true);
  }, []);

  return {
    loadStrategy: resolvedStrategy,
    shouldMountIframe: resolvedStrategy === 'eager' || admitted,
    activate,
  };
}

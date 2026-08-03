import { Children, isValidElement } from 'react';

const STORAGE_KEY = 'tiny-canvas-queue';

function getStoredBlocks() {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  if (!Array.isArray(queue)) {
    throw new TypeError('Stored canvas state must be an array.');
  }

  return queue;
}

function saveBlockState(blockId, state) {
  const queue = getStoredBlocks();
  const existingIndex = queue.findIndex((item) => item.id === blockId);
  const blockData = {
    ...(existingIndex >= 0 ? queue[existingIndex] : {}),
    ...state,
    id: blockId,
    time: new Date().toISOString().replace(/[:.]/g, '-'),
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = blockData;
  } else {
    queue.push(blockData);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/** djb2 string hash → 8-char hex */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Build a structural signature from a React element tree (types + shape only). */
function signature(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return '#text';

  const type = node.type;
  const name =
    typeof type === 'function'
      ? type.displayName || type.name || 'Anonymous'
      : typeof type === 'string'
        ? type
        : 'Fragment';

  const kids = node.props?.children;
  if (kids == null) return name;

  const childSigs = [];
  Children.forEach(kids, (child) => {
    const s = signature(child);
    if (s) childSigs.push(s);
  });

  return childSigs.length ? `${name}(${childSigs.join(',')})` : name;
}

/**
 * Generates a stable block ID from an explicit React key when available,
 * otherwise from the element structure and sibling index.
 */
export const generateBlockId = (element, index) => {
  const identity =
    isValidElement(element) && element.key !== null
      ? `key:${element.key}`
      : `${signature(element)}:${index}`;

  return `tc-block-${hash(identity)}`;
};

/**
 * Gets stored coordinates for a specific block ID from localStorage.
 * Returns null when the dragId has no saved position.
 */
export const getSavedPosition = (blockId) => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const queue = getStoredBlocks();
    const saved = queue.find((item) => item.id === blockId);
    if (
      !saved ||
      !Number.isFinite(saved.x) ||
      !Number.isFinite(saved.y)
    ) {
      return null;
    }

    return { x: saved.x, y: saved.y };
  } catch (error) {
    console.error('Error getting saved coordinates:', error);
    return null;
  }
};

/**
 * Saves position data for a block.
 */
export const savePosition = (blockId, position) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    saveBlockState(blockId, {
      x: position.x,
      y: position.y,
    });
  } catch (error) {
    console.error('Error saving block position:', error);
  }
};

/**
 * Gets a stored frame size from localStorage.
 */
export const getSavedSize = (blockId) => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const queue = getStoredBlocks();
    const saved = queue.find((item) => item.id === blockId);
    if (
      !saved ||
      !Number.isFinite(saved.width) ||
      !Number.isFinite(saved.height)
    ) {
      return null;
    }

    return { width: saved.width, height: saved.height };
  } catch (error) {
    console.error('Error getting saved size:', error);
    return null;
  }
};

/**
 * Saves size data without discarding a block's stored position.
 */
export const saveSize = (blockId, size) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    saveBlockState(blockId, {
      width: size.width,
      height: size.height,
    });
  } catch (error) {
    console.error('Error saving block size:', error);
  }
};

/**
 * Returns persisted geometry for the supplied canvas children, without
 * timestamps or stale entries from other boards.
 */
export const getCanvasChanges = (blocks) => {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const queue = getStoredBlocks();
    return queue.flatMap((saved) => {
      const block = blocks.get(saved.id);
      if (!block) {
        return [];
      }

      const change = {
        component: block.component,
        ...(Number.isInteger(block.index) ? { index: block.index } : {}),
        ...(block.key === undefined ? {} : { key: block.key }),
        ...(block.pageId === undefined ? {} : { pageId: block.pageId }),
        ...(block.pageTitle === undefined
          ? {}
          : { pageTitle: block.pageTitle }),
        id: block.sourceId ?? saved.id,
      };

      for (const property of ['x', 'y', 'width', 'height']) {
        if (Number.isFinite(saved[property])) {
          change[property] = saved[property];
        }
      }

      return ['x', 'y', 'width', 'height'].some(
        (property) => property in change
      )
        ? [change]
        : [];
    });
  } catch (error) {
    console.error('Error getting canvas changes:', error);
    return [];
  }
};

export const formatCanvasChanges = (changes) =>
  [
    'Apply these Tiny Canvas layout changes to the matching JSX components:',
    JSON.stringify(changes, null, 2),
  ].join('\n');

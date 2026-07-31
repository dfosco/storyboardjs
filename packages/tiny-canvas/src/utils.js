import { Children, isValidElement } from 'react';

const STORAGE_KEY = 'tiny-canvas-queue';

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
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!Array.isArray(queue)) {
      throw new TypeError('Stored canvas positions must be an array.');
    }

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
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!Array.isArray(queue)) {
      throw new TypeError('Stored canvas positions must be an array.');
    }
    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const blockData = {
      id: blockId,
      x: position.x,
      y: position.y,
      time: now,
    };
    const existingIndex = queue.findIndex((item) => item.id === blockId);

    if (existingIndex >= 0) {
      queue[existingIndex] = blockData;
    } else {
      queue.push(blockData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving block position:', error);
  }
};

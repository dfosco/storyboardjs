import { Children, isValidElement } from 'react';

const NODE_TYPES = new Set(['text', 'file', 'link', 'group']);
const SIDES = new Set(['top', 'right', 'bottom', 'left']);
const ENDS = new Set(['none', 'arrow']);
const BACKGROUND_STYLES = new Set(['cover', 'ratio', 'repeat']);
const PRESET_COLORS = new Set(['1', '2', '3', '4', '5', '6']);

const NOTE_COLORS = Object.freeze({
  yellow: '3',
  orange: '2',
  green: '4',
  purple: '6',
  blue: '#54AEFF',
  pink: '#FF8182',
});

function issue(path, message) {
  return { path, message };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isCanvasColor(value) {
  return (
    typeof value === 'string' &&
    (PRESET_COLORS.has(value) || /^#[0-9a-f]{6}$/i.test(value))
  );
}

function validateNode(node, index, nodeIds, issues) {
  const path = `nodes[${index}]`;
  if (!isPlainObject(node)) {
    issues.push(issue(path, 'Node must be an object.'));
    return;
  }

  if (typeof node.id !== 'string' || node.id.length === 0) {
    issues.push(issue(`${path}.id`, 'Node id must be a non-empty string.'));
  } else if (nodeIds.has(node.id)) {
    issues.push(issue(`${path}.id`, `Duplicate node id "${node.id}".`));
  } else {
    nodeIds.add(node.id);
  }

  if (!NODE_TYPES.has(node.type)) {
    issues.push(issue(`${path}.type`, 'Node type must be text, file, link, or group.'));
  }

  for (const property of ['x', 'y', 'width', 'height']) {
    if (!isInteger(node[property])) {
      issues.push(issue(`${path}.${property}`, 'Geometry must be an integer.'));
    }
  }

  if (node.color !== undefined && !isCanvasColor(node.color)) {
    issues.push(issue(`${path}.color`, 'Color must be a six-digit hex value or preset 1-6.'));
  }

  if (node.type === 'text' && typeof node.text !== 'string') {
    issues.push(issue(`${path}.text`, 'Text node text must be a string.'));
  }

  if (node.type === 'file') {
    if (typeof node.file !== 'string' || node.file.length === 0) {
      issues.push(issue(`${path}.file`, 'File node file must be a non-empty string.'));
    }
    if (node.subpath !== undefined &&
        (typeof node.subpath !== 'string' || !node.subpath.startsWith('#'))) {
      issues.push(issue(`${path}.subpath`, 'File subpath must start with #.'));
    }
  }

  if (node.type === 'link' && typeof node.url !== 'string') {
    issues.push(issue(`${path}.url`, 'Link node url must be a string.'));
  }

  if (node.type === 'group') {
    if (node.label !== undefined && typeof node.label !== 'string') {
      issues.push(issue(`${path}.label`, 'Group label must be a string.'));
    }
    if (node.background !== undefined && typeof node.background !== 'string') {
      issues.push(issue(`${path}.background`, 'Group background must be a string.'));
    }
    if (node.backgroundStyle !== undefined && !BACKGROUND_STYLES.has(node.backgroundStyle)) {
      issues.push(issue(`${path}.backgroundStyle`, 'Group backgroundStyle must be cover, ratio, or repeat.'));
    }
  }
}

function validateEdge(edge, index, nodeIds, edgeIds, issues) {
  const path = `edges[${index}]`;
  if (!isPlainObject(edge)) {
    issues.push(issue(path, 'Edge must be an object.'));
    return;
  }

  if (typeof edge.id !== 'string' || edge.id.length === 0) {
    issues.push(issue(`${path}.id`, 'Edge id must be a non-empty string.'));
  } else if (edgeIds.has(edge.id)) {
    issues.push(issue(`${path}.id`, `Duplicate edge id "${edge.id}".`));
  } else {
    edgeIds.add(edge.id);
  }

  for (const property of ['fromNode', 'toNode']) {
    if (typeof edge[property] !== 'string' || edge[property].length === 0) {
      issues.push(issue(`${path}.${property}`, `${property} must be a non-empty string.`));
    } else if (!nodeIds.has(edge[property])) {
      issues.push(issue(`${path}.${property}`, `Unknown node id "${edge[property]}".`));
    }
  }

  for (const property of ['fromSide', 'toSide']) {
    if (edge[property] !== undefined && !SIDES.has(edge[property])) {
      issues.push(issue(`${path}.${property}`, `${property} must be top, right, bottom, or left.`));
    }
  }

  for (const property of ['fromEnd', 'toEnd']) {
    if (edge[property] !== undefined && !ENDS.has(edge[property])) {
      issues.push(issue(`${path}.${property}`, `${property} must be none or arrow.`));
    }
  }

  if (edge.color !== undefined && !isCanvasColor(edge.color)) {
    issues.push(issue(`${path}.color`, 'Color must be a six-digit hex value or preset 1-6.'));
  }
  if (edge.label !== undefined && typeof edge.label !== 'string') {
    issues.push(issue(`${path}.label`, 'Edge label must be a string.'));
  }
}

/** Validate JSON Canvas 1.0 document. Returns structured issues. */
export function validateCanvasDocument(document) {
  const issues = [];
  if (!isPlainObject(document)) {
    return { valid: false, issues: [issue('$', 'Canvas document must be an object.')] };
  }
  if (document.nodes !== undefined && !Array.isArray(document.nodes)) {
    issues.push(issue('nodes', 'nodes must be an array when provided.'));
  }
  if (document.edges !== undefined && !Array.isArray(document.edges)) {
    issues.push(issue('edges', 'edges must be an array when provided.'));
  }

  const nodeIds = new Set();
  const edgeIds = new Set();
  (document.nodes || []).forEach((node, index) => validateNode(node, index, nodeIds, issues));
  (document.edges || []).forEach((edge, index) => validateEdge(edge, index, nodeIds, edgeIds, issues));
  return { valid: issues.length === 0, issues };
}

export function assertValidCanvasDocument(document) {
  const result = validateCanvasDocument(document);
  if (!result.valid) {
    const error = new TypeError(`Invalid JSON Canvas document: ${result.issues[0].message}`);
    error.issues = result.issues;
    throw error;
  }
  return document;
}

export function normalizeCanvasDocument(document) {
  const normalized = JSON.parse(JSON.stringify(document));
  if (normalized.nodes === undefined) normalized.nodes = [];
  if (normalized.edges === undefined) normalized.edges = [];
  assertValidCanvasDocument(normalized);
  return normalized;
}

export function parseCanvasJSON(source) {
  if (typeof source !== 'string') return normalizeCanvasDocument(source);
  return normalizeCanvasDocument(JSON.parse(source));
}

const DEFAULT_NODE_SIZE = Object.freeze({
  Block: { width: 300, height: 120 },
  Frame: { width: 1270, height: 776 },
  Image: { width: 400, height: 300 },
  Link: { width: 320, height: 120 },
  Mark: { width: 530, height: 170 },
  Note: { width: 270, height: 170 },
});

function elementName(element) {
  const type = element?.type;
  return type?.displayName || type?.name || 'Widget';
}

function textChildren(children) {
  let text = '';
  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') text += String(child);
  });
  return text;
}

function integerDimension(value, fallback) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}

function serializableProps(props) {
  return Object.fromEntries(
    Object.entries(props || {}).filter(([key, value]) => {
      if (['children', 'key', 'ref', 'x', 'y', 'width', 'height', 'id'].includes(key)) return false;
      try {
        JSON.stringify(value);
        return typeof value !== 'function';
      } catch {
        return false;
      }
    })
  );
}

/** Materialize JSX/compiled MDX canvas children into JSON Canvas. */
export function materializeReactChildren(children, { widgets = {} } = {}) {
  const nodes = [];
  const warnings = [];
  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        warnings.push({ index, code: 'UNSUPPORTED_CHILD', message: 'Canvas child is not a React element.' });
      }
      return;
    }

    const component = elementName(child);
    const props = child.props || {};
    const defaults = DEFAULT_NODE_SIZE[component] || DEFAULT_NODE_SIZE.Block;
    const base = {
      id: typeof props.id === 'string' && props.id ? props.id : `node-${index}`,
      x: integerDimension(props.x, 0),
      y: integerDimension(props.y, 0),
      width: integerDimension(props.width, defaults.width),
      height: integerDimension(props.height, defaults.height),
    };

    if (component === 'Note' || component === 'Mark') {
      const text = component === 'Note' ? props.text ?? textChildren(props.children) : props.content ?? textChildren(props.children);
      const node = { ...base, type: 'text', text: String(text ?? '') };
      if (component === 'Note' && props.color) node.color = canvasColorFromNoteColor(props.color);
      node['x-tiny-canvas'] = { component };
      nodes.push(node);
      return;
    }

    if (component === 'Image') {
      nodes.push({ ...base, type: 'file', file: String(props.src || ''), ...(props.alt ? { 'x-tiny-canvas': { component, alt: props.alt } } : {}) });
      return;
    }

    if (component === 'Link') {
      const url = String(props.url || '');
      nodes.push({
        ...base,
        type: 'link',
        url,
        'x-tiny-canvas': {
          component,
          title: props.title || url,
          displayUrl: props.displayUrl || url,
        },
      });
      return;
    }

    if (component === 'Frame') {
      const route = String(props.route || '');
      nodes.push({
        ...base,
        type: 'link',
        url: route,
        'x-tiny-canvas': {
          component,
          title: props.title || route,
          description: props.description,
          prepend: props.prepend,
          append: props.append ?? props.apend,
        },
      });
      return;
    }

    const widget = widgets[component];
    const text = textChildren(props.children);
    if (widget || text) {
      nodes.push({
        ...base,
        type: 'text',
        text,
        'x-tiny-canvas': {
          component,
          renderer: widget || component,
          props: serializableProps(props),
        },
      });
    } else {
      warnings.push({ index, code: 'UNSERIALIZABLE_WIDGET', message: `Canvas component "${component}" has no serializable renderer.` });
    }
  });

  const document = normalizeCanvasDocument({ nodes, edges: [] });
  return { document, warnings };
}

/** Materialize MDX through host compiler, keeping MDX tooling optional. */
export async function materializeCanvasMDX(source, { compile } = {}) {
  if (typeof compile !== 'function') {
    throw new TypeError('MDX materialization requires a compile(source) function.');
  }
  const result = await compile(source);
  if (result?.nodes || result?.edges) return { document: normalizeCanvasDocument(result), warnings: [] };
  return materializeReactChildren(result);
}

function jsonlRecordKind(record) {
  if (record.kind) return record.kind;
  if (record.fromNode || record.toNode) return 'edge';
  if (record.type) return 'node';
  return 'meta';
}

/** Parse JSONL records into one canonical document. */
export function parseCanvasJSONL(source) {
  const document = { nodes: [], edges: [] };
  const lines = String(source)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const [index, line] of lines.entries()) {
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      throw new SyntaxError(`Invalid JSONL at line ${index + 1}: ${error.message}`);
    }
    const kind = jsonlRecordKind(record);
    if (kind === 'document') {
      Object.assign(document, record.document || record);
      continue;
    }
    if (kind === 'node') {
      const { kind: _kind, ...node } = record;
      document.nodes.push(node);
    } else if (kind === 'edge') {
      const { kind: _kind, ...edge } = record;
      document.edges.push(edge);
    } else if (kind === 'meta') {
      const { kind: _kind, ...meta } = record;
      Object.assign(document, meta);
    } else {
      throw new TypeError(`Unknown JSONL record kind "${kind}" at line ${index + 1}.`);
    }
  }

  return normalizeCanvasDocument(document);
}

export function serializeCanvasJSON(document, { pretty = false } = {}) {
  const normalized = normalizeCanvasDocument(document);
  return JSON.stringify(normalized, null, pretty ? 2 : 0);
}

/** Serialize one document as node/edge/meta JSONL records. */
export function serializeCanvasJSONL(document) {
  const normalized = normalizeCanvasDocument(document);
  const lines = [];
  for (const node of normalized.nodes) {
    lines.push(JSON.stringify({ kind: 'node', ...node }));
  }
  for (const edge of normalized.edges) {
    lines.push(JSON.stringify({ kind: 'edge', ...edge }));
  }
  const metadata = Object.fromEntries(
    Object.entries(normalized).filter(([key]) => key !== 'nodes' && key !== 'edges')
  );
  if (Object.keys(metadata).length) lines.push(JSON.stringify({ kind: 'meta', ...metadata }));
  return lines.join('\n');
}

/** Serialize canonical document as self-contained MDX using JsonCanvas. */
export function serializeCanvasMDX(document, { importPath = '@dfosco/tiny-canvas' } = {}) {
  const normalized = normalizeCanvasDocument(document);
  return [
    `import { JsonCanvas } from ${JSON.stringify(importPath)}`,
    '',
    `<JsonCanvas document={${JSON.stringify(normalized, null, 2)}} />`,
    '',
  ].join('\n');
}

/** Materialize JSON or JSONL source into one canonical document. */
export function materializeCanvasSource(source, { format } = {}) {
  if (format === 'jsonl') return parseCanvasJSONL(source);
  if (format === 'mdx') {
    throw new TypeError('Use materializeCanvasMDX for MDX sources because compilation is asynchronous.');
  }
  if (format === 'json' || format === undefined) {
    if (typeof source === 'string') {
      const trimmed = source.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.kind || parsed?.type === 'text' || parsed?.type === 'file' || parsed?.type === 'link' || parsed?.type === 'group') {
          return parseCanvasJSONL(trimmed);
        }
      } catch {
        return parseCanvasJSONL(trimmed);
      }
    }
    return parseCanvasJSON(source);
  }
  throw new TypeError(`Unsupported canvas source format "${format}".`);
}

export function applyCanvasGeometry(document, changes) {
  const changeMap = new Map((changes || []).map((change) => [change.id, change]));
  const next = normalizeCanvasDocument(document);
  next.nodes = next.nodes.map((node) => {
    const change = changeMap.get(node.id);
    if (!change) return node;
    return {
      ...node,
      ...Object.fromEntries(
        ['x', 'y', 'width', 'height']
          .filter((property) => Number.isFinite(change[property]))
          .map((property) => [property, Math.round(change[property])])
      ),
    };
  });
  return normalizeCanvasDocument(next);
}

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = 'tiny-canvas-document:';

export function getStoredCanvasDocument(key) {
  if (typeof localStorage === 'undefined' || !key) return null;
  try {
    const stored = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${key}`));
    if (stored?.version !== STORAGE_VERSION) return null;
    return normalizeCanvasDocument(stored.document);
  } catch {
    return null;
  }
}

export function saveStoredCanvasDocument(key, document) {
  if (typeof localStorage === 'undefined' || !key) return;
  localStorage.setItem(
    `${STORAGE_PREFIX}${key}`,
    JSON.stringify({ version: STORAGE_VERSION, document: normalizeCanvasDocument(document) })
  );
}

export function clearStoredCanvasDocument(key) {
  if (typeof localStorage === 'undefined' || !key) return;
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}

export function canvasColorFromNoteColor(color) {
  return NOTE_COLORS[color] || color;
}

export const JSON_CANVAS_NODE_TYPES = Object.freeze([...NODE_TYPES]);
export const JSON_CANVAS_SIDES = Object.freeze([...SIDES]);
export const JSON_CANVAS_ENDS = Object.freeze([...ENDS]);
export const JSON_CANVAS_NOTE_COLORS = NOTE_COLORS;

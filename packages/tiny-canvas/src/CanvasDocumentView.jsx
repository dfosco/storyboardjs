import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Block from './Block';
import Canvas from './Canvas';
import FileNode from './FileNode';
import Frame from './Frame';
import Group from './Group';
import Image from './Image';
import Link from './Link';
import Mark from './Mark';
import {
  materializeCanvasMDX,
  materializeCanvasSource,
  getStoredCanvasDocument,
  normalizeCanvasDocument,
  saveStoredCanvasDocument,
} from './jsoncanvas';

function isHttpUrl(value) {
  try {
    const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href;
    const url = new URL(value, base);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function displayUrl(url) {
  try {
    const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href;
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function colorValue(color) {
  if (typeof color !== 'string') return undefined;
  if (color.startsWith('#')) return color;
  return {
    '1': '#ffebe9',
    '2': '#fff1e5',
    '3': '#fff8c5',
    '4': '#dafbe1',
    '5': '#ddf4ff',
    '6': '#fbefff',
  }[color];
}

function nodeElement(node, renderers, onGeometryChange) {
  const extension = node['x-tiny-canvas'] || {};
  const common = {
    key: node.id,
    id: node.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    onPositionChange: (position) => onGeometryChange(node.id, position),
    style: node.color
      ? {
          '--tc-block-bg': colorValue(node.color),
          '--tc-mark-bg': colorValue(node.color),
          '--tc-group-bg': colorValue(node.color),
        }
      : undefined,
  };

  if (extension.renderer && renderers?.[extension.renderer]) {
    return createElement(
      Block,
      common,
      createElement(renderers[extension.renderer], {
        id: node.id,
        ...(extension.props || {}),
      })
    );
  }
  if (extension.component === 'Frame') {
    return createElement(Frame, {
      ...common,
      route: node.url,
      title: extension.title || node.url,
      description: extension.description,
      prepend: extension.prepend,
      append: extension.append,
      onSizeChange: (size) => onGeometryChange(node.id, size),
    });
  }
  if (node.type === 'text') {
    return createElement(Mark, {
      ...common,
      content: node.text || '',
      onSizeChange: (size) => onGeometryChange(node.id, size),
    });
  }
  if (node.type === 'file') {
    const isImage = /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(node.file);
    return isImage
      ? createElement(Image, {
          ...common,
          src: node.file,
          alt: extension.alt || '',
          onSizeChange: (size) => onGeometryChange(node.id, size),
        })
      : createElement(FileNode, { ...common, file: node.file, subpath: node.subpath });
  }
  if (node.type === 'group') {
    return createElement(Group, {
      ...common,
      label: node.label,
      background: node.background,
      backgroundStyle: node.backgroundStyle,
      onSizeChange: (size) => onGeometryChange(node.id, size),
    });
  }
  if (node.type === 'link') {
    if (!isHttpUrl(node.url)) return createElement(Block, { ...common }, node.url);
    return createElement(Link, {
      ...common,
      url: node.url,
      title: extension.title || node.url,
      displayUrl: extension.displayUrl || displayUrl(node.url),
    });
  }
  return null;
}

/** Document-driven JSON Canvas renderer. */
const CanvasDocumentView = forwardRef(function CanvasDocumentView({
  document: source,
  renderers,
  onDocumentChange,
  format = 'json',
  compileMDX,
  onMaterializeWarning,
  storageKey,
  ...canvasProps
}, ref) {
  const sourceDocument = useMemo(() => {
    if (format === 'mdx') return null;
    return normalizeCanvasDocument(
      typeof source === 'string' ? materializeCanvasSource(source, { format }) : source
    );
  }, [format, source]);
  const storedDocument = useMemo(
    () => storageKey ? getStoredCanvasDocument(storageKey) : null,
    [storageKey]
  );
  const [document, setDocument] = useState(storedDocument || sourceDocument);
  const documentRef = useRef(document);
  const canvasRef = useRef(null);
  useEffect(() => {
    let active = true;
    if (format !== 'mdx') {
      const nextDocument = storedDocument || sourceDocument;
      documentRef.current = nextDocument;
      setDocument(nextDocument);
      return () => {
        active = false;
      };
    }
    materializeCanvasMDX(source, { compile: compileMDX })
      .then(({ document: nextDocument, warnings }) => {
        if (!active) return;
        documentRef.current = nextDocument;
        setDocument(nextDocument);
        onMaterializeWarning?.(warnings);
      })
      .catch((error) => {
        if (active) onMaterializeWarning?.([{ path: '$', message: error.message }]);
      });
    return () => {
      active = false;
    };
  }, [compileMDX, format, onMaterializeWarning, source, sourceDocument, storageKey, storedDocument]);
  const onGeometryChange = useCallback((id, geometry) => {
    const current = documentRef.current;
    if (!current) return;
    const next = normalizeCanvasDocument({
      ...current,
      nodes: current.nodes.map((node) => node.id === id
        ? {
            ...node,
            ...Object.fromEntries(
              Object.entries(geometry).map(([key, value]) => [key, Math.round(value)])
            ),
          }
        : node),
    });
    documentRef.current = next;
    setDocument(next);
    if (storageKey) saveStoredCanvasDocument(storageKey, next);
    onDocumentChange?.(next, { id, ...geometry });
  }, [onDocumentChange, storageKey]);
  const nodes = document?.nodes || [];
  const children = useMemo(
    () => nodes.map((node) => nodeElement(node, renderers, onGeometryChange)),
    [nodes, onGeometryChange, renderers]
  );
  useImperativeHandle(ref, () => ({
    getViewport: (...args) => canvasRef.current?.getViewport(...args),
    setViewport: (...args) => canvasRef.current?.setViewport(...args),
    panTo: (...args) => canvasRef.current?.panTo(...args),
    centerOnNode: (...args) => canvasRef.current?.centerOnNode(...args) ?? false,
    fitToNodes: (...args) => canvasRef.current?.fitToNodes(...args) ?? false,
    zoomTo: (...args) => canvasRef.current?.zoomTo(...args),
    zoomBy: (...args) => canvasRef.current?.zoomBy(...args),
    getDocument: () => document,
  }), [document]);
  if (!document) return null;
  return <Canvas ref={canvasRef} {...canvasProps} edges={document.edges} graphNodes={document.nodes}>{children}</Canvas>;
});

export default CanvasDocumentView;

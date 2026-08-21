import Block from './Block';
import { authorizeCanvasChild } from './canvasChild';

function FileNode({ file, subpath, className, ...blockProps }) {
  if (typeof file !== 'string' || !file) {
    throw new TypeError('FileNode file must be a non-empty string.');
  }
  return (
    <Block
      {...blockProps}
      className={['tc-file-block', className].filter(Boolean).join(' ')}
    >
      <a href={file} target="_blank" rel="noopener noreferrer" className="tc-file-link">
        <strong>{file}</strong>
        {subpath ? <span>{subpath}</span> : null}
      </a>
    </Block>
  );
}

FileNode.displayName = 'FileNode';

export default authorizeCanvasChild(FileNode);

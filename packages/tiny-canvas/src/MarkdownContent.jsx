import ReactMarkdown from 'react-markdown';

const components = {
  a: ({ node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

export default function MarkdownContent({ children, className }) {
  if (typeof children !== 'string') {
    throw new TypeError('Markdown content must be a string.');
  }

  return (
    <div className={className}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}

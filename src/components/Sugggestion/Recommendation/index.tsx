import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface RecommendationProps {
  text: string;
}
export const Recommendation = ({ text }: RecommendationProps): JSX.Element => {
  const markedDownText = `~~~${text}~~~`;

  return (
    <>
      <ReactMarkdown
        children={markedDownText}
        remarkPlugins={[remarkGfm]}
        className='prose'
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match ? (
              <SyntaxHighlighter
                data-testid='code-block'
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={dark}
                language={match[1]}
                PreTag='div'
              />
            ) : (
              <code data-testid='markdown-text' {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      />
    </>
  );
};

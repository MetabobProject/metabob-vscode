import { render } from '@testing-library/react';
import { Recommendation } from './index';

describe('Recommendation', () => {
  it('renders without crashing', () => {
    const text = 'This is a sample text';
    const { getByText } = render(<Recommendation text={text} />);
    const textElement = getByText(text);
    expect(textElement).toBeInTheDocument();
  });

  it('renders Markdown text correctly', () => {
    const text = 'This is a sample text';
    const { getByTestId } = render(<Recommendation text={text} />);
    const markdownTextElement = getByTestId('markdown-text');
    expect(markdownTextElement).toBeInTheDocument();
    expect(markdownTextElement).toHaveTextContent(`~~~${text}~~~`);
  });

  it('renders SyntaxHighlighter for code blocks', () => {
    const codeText = 'console.log("Hello, world!")';
    const { getByTestId } = render(<Recommendation text={codeText} />);
    const codeBlockElement = getByTestId('code-block');
    expect(codeBlockElement).toBeInTheDocument();
    expect(codeBlockElement).toHaveTextContent(codeText);
  });
});

import { render } from '@testing-library/react';
import { Recommendation } from './index';

describe('Recommendation', () => {
  it('renders without crashing', () => {
    const text = 'This is a sample text';
    const { getByTestId } = render(<Recommendation text={text} />);
    const textElement = getByTestId('code-block');
    expect(textElement).toBeInTheDocument();
  });
});

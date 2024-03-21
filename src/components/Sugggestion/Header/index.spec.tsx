import { render } from '@testing-library/react';
import { Header } from './index';

describe('Header', () => {
  it('renders category and description', () => {
    const category = 'Category';
    const description = 'Description';
    const { getByTestId } = render(<Header category={category} description={description} />);

    expect(getByTestId('category')).toBeInTheDocument();
    expect(getByTestId('category')).toHaveTextContent('Problem Category:');
    expect(getByTestId('category')).toHaveTextContent('Category');

    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('description')).toHaveTextContent('Problem Description:');
    expect(getByTestId('description')).toHaveTextContent('Description');
  });

  it('renders only category', () => {
    const category = 'Category';
    const { getByTestId, queryByTestId } = render(<Header category={category} />);

    expect(getByTestId('category')).toBeInTheDocument();
    expect(getByTestId('category')).toHaveTextContent('Problem Category:');
    expect(getByTestId('category')).toHaveTextContent('Category');

    expect(queryByTestId('description')).toBeNull();
  });

  it('renders only description', () => {
    const description = 'Description';
    const { getByTestId, queryByTestId } = render(<Header description={description} />);

    expect(queryByTestId('category')).toBeNull();

    expect(getByTestId('description')).toBeInTheDocument();
    expect(getByTestId('description')).toHaveTextContent('Problem Description:');
    expect(getByTestId('description')).toHaveTextContent('Description');
  });

  it('does not render anything when neither category nor description is provided', () => {
    const { queryByTestId } = render(<Header />);

    expect(queryByTestId('category')).toBeNull();
    expect(queryByTestId('description')).toBeNull();
  });
});

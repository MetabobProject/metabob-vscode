import { render, fireEvent } from '@testing-library/react';
import { Feedback } from './index';

describe('Feedback', () => {
  it('renders correctly', () => {
    const handleDiscardClick = jest.fn();
    const handleEndorseClick = jest.fn();
    const { getByTestId } = render(
      <Feedback handleDiscardClick={handleDiscardClick} handleEndorseClick={handleEndorseClick} />,
    );
    const discardButton = getByTestId('discard-button');
    const endorseButton = getByTestId('endorse-button');
    expect(discardButton).toBeInTheDocument();
    expect(endorseButton).toBeInTheDocument();
  });

  it('calls handleDiscardClick on Discard button click', () => {
    const handleDiscardClick = jest.fn();
    const handleEndorseClick = jest.fn();
    const { getByTestId } = render(
      <Feedback handleDiscardClick={handleDiscardClick} handleEndorseClick={handleEndorseClick} />,
    );
    const discardButton = getByTestId('discard-button');
    fireEvent.click(discardButton);
    expect(handleDiscardClick).toHaveBeenCalledTimes(1);
    expect(handleEndorseClick).not.toHaveBeenCalled();
  });

  it('calls handleEndorseClick on Endorse button click', () => {
    const handleDiscardClick = jest.fn();
    const handleEndorseClick = jest.fn();
    const { getByTestId } = render(
      <Feedback handleDiscardClick={handleDiscardClick} handleEndorseClick={handleEndorseClick} />,
    );
    const endorseButton = getByTestId('endorse-button');
    fireEvent.click(endorseButton);
    expect(handleEndorseClick).toHaveBeenCalledTimes(1);
    expect(handleDiscardClick).not.toHaveBeenCalled();
  });
});

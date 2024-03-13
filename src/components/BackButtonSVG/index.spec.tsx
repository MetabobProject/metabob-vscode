import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { BackButtonSVG, BackButtonSVGProps } from './index';

describe('BackButtonSVG component', () => {
  test('renders SVG with default props', () => {
    const { container } = render(
      <RecoilRoot>
        <BackButtonSVG />
      </RecoilRoot>,
    );
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // Ensure default props are applied
    expect(svgElement).toHaveAttribute('width', '16');
    expect(svgElement).toHaveAttribute('height', '16');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 22 16');
    expect(svgElement).toHaveAttribute('fill', 'none');
  });

  test('renders SVG with custom props', () => {
    const customProps: BackButtonSVGProps = {
      width: '24',
      height: '24',
      viewBox: '0 0 32 24',
      fill: 'blue',
    };
    const { container } = render(
      <RecoilRoot>
        <BackButtonSVG {...customProps} />
      </RecoilRoot>,
    );
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // Ensure custom props are applied
    expect(svgElement).toHaveAttribute('width', '24');
    expect(svgElement).toHaveAttribute('height', '24');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 32 24');
    expect(svgElement).toHaveAttribute('fill', 'blue');
  });
});

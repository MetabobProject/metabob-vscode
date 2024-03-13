import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ExtensionSVG, ExtensionSVGProps } from './index';

describe('ExtensionSVG component', () => {
  test('renders SVG with default props', () => {
    const { container } = render(
      <RecoilRoot>
        <ExtensionSVG />
      </RecoilRoot>,
    );
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // Ensure default props are applied
    expect(svgElement).toHaveAttribute('width', '120');
    expect(svgElement).toHaveAttribute('height', '39');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 132 39');
    expect(svgElement).toHaveAttribute('fill', 'none');
  });

  test('renders SVG with custom props', () => {
    const customProps: ExtensionSVGProps = {
      width: '24',
      height: '24',
      viewBox: '0 0 32 24',
      fill: 'blue',
    };
    const { container } = render(
      <RecoilRoot>
        <ExtensionSVG {...customProps} />
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

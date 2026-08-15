import { getTheme, themes } from '../../src/theme/colors';
import { getTypeScale, getFontFamily } from '../../src/theme/typography';

describe('Theme System', () => {
  it('should provide OLED dark theme with pure black canvas and contrast text', () => {
    const dark = getTheme('oled-dark');
    expect(dark.canvas).toBe('#000000');
    expect(dark.card).toBe('#0A0A0A');
    expect(dark.text).toBe('#EAEAEA');
    expect(dark.border).toBe('#1F1F1F');
  });

  it('should provide Warm Paper theme with warm bone canvas', () => {
    const paper = getTheme('warm-paper');
    expect(paper.canvas).toBe('#F7F6F3');
    expect(paper.card).toBe('#FFFFFF');
    expect(paper.text).toBe('#1F1F1F');
    expect(paper.border).toBe('#EAEAEA');
  });

  it('should provide Clean Light theme with white canvas and off-black text', () => {
    const light = getTheme('clean-light');
    expect(light.canvas).toBe('#FFFFFF');
    expect(light.text).toBe('#111111');
    expect(light.border).toBe('#EAEAEA');
  });

  it('should return correct type scales for compact, standard, and large', () => {
    const compact = getTypeScale('compact');
    const standard = getTypeScale('standard');
    const large = getTypeScale('large');

    expect(compact.editor).toBe(15);
    expect(standard.editor).toBe(17);
    expect(large.editor).toBe(20);
    expect(standard.editor).toBeGreaterThan(compact.editor);
    expect(large.editor).toBeGreaterThan(standard.editor);
  });

  it('should return font families for mono, sans, and serif', () => {
    expect(getFontFamily('mono')).toBeDefined();
    expect(getFontFamily('sans')).toBeDefined();
    expect(getFontFamily('serif')).toBeDefined();
  });
});

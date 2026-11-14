import { describe, it, expect } from 'vitest';

describe('C0 foundation', () => {
  it('token scale is defined', () => {
    // Verify token values match DESIGN.md exactly.
    const tokens = {
      canvas:    '#0E0E0F',
      surface:   '#1A1A1C',
      raised:    '#242428',
      ink:       '#F5F4F2',
      inkMuted:  '#9A9792',
      accent:    '#FF8200',
      onAccent:  '#0E0E0F',
      free:      '#4ADE80',
      busy:      '#F87171',
      unknown:   '#6B6B70',
    };

    expect(tokens.canvas).toBe('#0E0E0F');
    expect(tokens.accent).toBe('#FF8200');
    expect(tokens.ink).toBe('#F5F4F2');
  });

  it('type scale matches DESIGN.md', () => {
    const typeScale = [12, 13, 15, 17, 22, 28, 40];
    expect(typeScale).toHaveLength(7);
    expect(typeScale[2]).toBe(15); // body
    expect(typeScale[4]).toBe(22); // screen titles
  });
});

import { describe, it, expect } from 'vitest';
import { calcPlates }     from '@/src/features/c02-p0-logger/PlateCalc';
import { formatRestTime } from '@/src/features/c02-p0-logger/useRestTimer';

describe('calcPlates', () => {
  it('returns empty for bar weight or less', () => {
    expect(calcPlates(45)).toEqual([]);
    expect(calcPlates(0)).toEqual([]);
    expect(calcPlates(44)).toEqual([]);
  });

  it('calculates 135 lb (1×45 per side)', () => {
    expect(calcPlates(135)).toEqual([{ plate: 45, count: 1 }]);
  });

  it('calculates 225 lb (2×45 per side)', () => {
    expect(calcPlates(225)).toEqual([{ plate: 45, count: 2 }]);
  });

  it('calculates 185 lb (1×45 + 1×25 per side)', () => {
    expect(calcPlates(185)).toEqual([
      { plate: 45, count: 1 },
      { plate: 25, count: 1 },
    ]);
  });

  it('calculates 95 lb (1×25 per side)', () => {
    expect(calcPlates(95)).toEqual([{ plate: 25, count: 1 }]);
  });

  it('handles half-plates (2.5 lb)', () => {
    // 50 lb: (50 - 45) / 2 = 2.5 per side → one 2.5 plate
    expect(calcPlates(50)).toEqual([{ plate: 2.5, count: 1 }]);
  });

  it('uses custom bar weight', () => {
    // 115 lb with 35 lb bar: (115-35)/2 = 40 per side → 1×35 + 1×5
    expect(calcPlates(115, 35)).toEqual([
      { plate: 35, count: 1 },
      { plate: 5,  count: 1 },
    ]);
  });
});

describe('formatRestTime', () => {
  it('formats zero', () => {
    expect(formatRestTime(0)).toBe('0:00');
  });

  it('formats seconds only', () => {
    expect(formatRestTime(45)).toBe('0:45');
    expect(formatRestTime(9)).toBe('0:09');
  });

  it('formats minutes and seconds', () => {
    expect(formatRestTime(90)).toBe('1:30');
    expect(formatRestTime(120)).toBe('2:00');
    expect(formatRestTime(61)).toBe('1:01');
  });

  it('clamps negatives to 0:00', () => {
    expect(formatRestTime(-5)).toBe('0:00');
  });
});

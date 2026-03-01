import { minutesToDecimalHours } from './time.js';

describe('minutesToDecimalHours', () => {
  it('converts 0 minutes', () => {
    expect(minutesToDecimalHours(0)).toBe('0.00');
  });

  it('converts 60 minutes to 1 hour', () => {
    expect(minutesToDecimalHours(60)).toBe('1.00');
  });

  it('converts 90 minutes to 1.50 hours', () => {
    expect(minutesToDecimalHours(90)).toBe('1.50');
  });

  it('converts 45 minutes to 0.75 hours', () => {
    expect(minutesToDecimalHours(45)).toBe('0.75');
  });

  it('converts 480 minutes to 8 hours', () => {
    expect(minutesToDecimalHours(480)).toBe('8.00');
  });

  it('handles non-round values', () => {
    expect(minutesToDecimalHours(100)).toBe('1.67');
  });
});

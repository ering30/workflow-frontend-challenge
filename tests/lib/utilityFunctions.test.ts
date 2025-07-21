import { it, expect, describe } from 'vitest'
import { toTitleCase } from '../../src/lib/utilityFunctions';

describe('toTitleCase', () => {
  it('should convert a string to title case', () => {
    const input = 'hello world';
    const expected = 'Hello World';
    expect(toTitleCase(input)).toBe(expected);
  });

  it('should handle single words', () => {
    const input = 'javascript';
    const expected = 'Javascript';
    expect(toTitleCase(input)).toBe(expected);
  });

  it('should handle mixed case input', () => {
    const input = 'hElLo WoRlD';
    const expected = 'Hello World';
    expect(toTitleCase(input)).toBe(expected);
  });

  it('should return an empty string when input is empty', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('should return empty string when input is undefined', () => {
    expect(toTitleCase(undefined)).toBe('');
  });
}) 
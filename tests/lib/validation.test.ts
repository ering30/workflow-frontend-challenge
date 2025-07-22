import { it, expect, describe } from 'vitest'
import { sanitisedStringInput, sanitisedUrl } from '../../src/lib/validation'

describe('sanitisedStringInput', () => {
  it('should return an sanitised string for an invalid input', () => {
    expect(sanitisedStringInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
  })

  it('should return a trimmed string', () => {
    expect(sanitisedStringInput('   some input   ')).toBe('some input');
  })

  it('should return an empty string for an empty input', () => {
    expect(sanitisedStringInput('')).toBe('');
  })

  it('should return the same string for a valid input', () => {
    expect(sanitisedStringInput('valid input')).toBe('valid input');
  })
})

describe('sanitisedUrl', () => {
  it('should return an empty string for an invalid url', () => {
    expect(sanitisedUrl('<script>alert("xss")</script>')).toBe('');
  })

  it('should return a trimmed string', () => {
    expect(sanitisedUrl('   https://example.com   ')).toBe('https://example.com');
  })

  it('should return an empty string for an empty input', () => {
    expect(sanitisedUrl('')).toBe('');
  })

  it('should return the same string for a valid input', () => {
    expect(sanitisedUrl('https://example.com')).toBe('https://example.com');
  })
})
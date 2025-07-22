import { escape, isURL } from 'validator';

export const sanitisedStringInput = (input: string): string => {
  if (!input) return '';
  if (input.trim() === '') return '';

  return escape(input.trim());
};

export const sanitisedUrl = (url: string): string => {
  if (!url) return '';

  const trimmedUrl = url.trim();
  if (trimmedUrl === '') return '';

  if (!isURL(trimmedUrl)) return '';
  return trimmedUrl;
};

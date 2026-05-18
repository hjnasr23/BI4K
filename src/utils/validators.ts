import { MAX_FILE_SIZE_MB } from './constants';

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPrompt = (prompt: string): boolean => prompt.trim().length >= 3 && prompt.length <= 500;
export const isValidFileSize = (file: File): boolean => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

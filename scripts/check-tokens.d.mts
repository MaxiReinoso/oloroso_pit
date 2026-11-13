export type TokenViolation = {
  file: string;
  line: number;
  column: number;
  value: string;
};

export function findViolations(content: string, file?: string): TokenViolation[];
export function collectSourceFiles(root: string): string[];
export function scanDirectory(root: string): TokenViolation[];

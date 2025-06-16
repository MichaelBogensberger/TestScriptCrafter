export interface ValidationIssue {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  diagnostics: string;
  location: string[];
  details?: string | null;
  expression?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  issues: ValidationIssue[];
} 
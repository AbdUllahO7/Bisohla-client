// src/config/zod.config.ts
import { z } from 'zod';

const formatFieldName = (path: (string | number)[]) => {
  const field = path.join('.');
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str)
    .trim();
};

export const initZodConfig = () => {
  z.setErrorMap((issue, ctx) => {
    const fieldName = formatFieldName(issue.path);
    let message: string;

    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          message = `${fieldName} is required`;
        } else {
          message = `${fieldName} must be ${issue.expected}, received ${issue.received}`;
        }
        break;

      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          message = `${fieldName} must be a valid email address`;
        } else if (issue.validation === 'url') {
          message = `${fieldName} must be a valid URL`;
        } else if (issue.validation === 'uuid') {
          message = `${fieldName} must be a valid UUID`;
        } else if (issue.validation === 'cuid') {
          message = `${fieldName} must be a valid CUID`;
        } else if (issue.validation === 'regex') {
          message = `${fieldName} has invalid format`;
        } else if (issue.validation === 'datetime') {
          message = `${fieldName} must be a valid datetime`;
        } else {
          message = `${fieldName} is invalid`;
        }
        break;

      case z.ZodIssueCode.too_small:
        if (issue.type === 'string') {
          if (issue.minimum === 1) {
            message = `${fieldName} cannot be empty`;
          } else {
            message = `${fieldName} must be at least ${issue.minimum} characters`;
          }
        } else if (issue.type === 'number') {
          message = `${fieldName} must be greater than ${
            issue.inclusive ? 'or equal to ' : ''
          }${issue.minimum}`;
        } else if (issue.type === 'array') {
          message = `${fieldName} must contain at least ${issue.minimum} item${
            issue.minimum === 1 ? '' : 's'
          }`;
        } else {
          message = `${fieldName} must be greater than ${
            issue.inclusive ? 'or equal to ' : ''
          }${issue.minimum}`;
        }
        break;

      case z.ZodIssueCode.too_big:
        if (issue.type === 'string') {
          message = `${fieldName} must not exceed ${issue.maximum} characters`;
        } else if (issue.type === 'number') {
          message = `${fieldName} must be less than ${
            issue.inclusive ? 'or equal to ' : ''
          }${issue.maximum}`;
        } else if (issue.type === 'array') {
          message = `${fieldName} must contain at most ${issue.maximum} item${
            issue.maximum === 1 ? '' : 's'
          }`;
        } else {
          message = `${fieldName} must be less than ${
            issue.inclusive ? 'or equal to ' : ''
          }${issue.maximum}`;
        }
        break;

      case z.ZodIssueCode.invalid_date:
        message = `${fieldName} must be a valid date`;
        break;

      case z.ZodIssueCode.invalid_enum_value:
        message = `${fieldName} must be one of: ${
          Array.isArray(issue.options) ? issue.options.join(', ') : 'unknown'
        }`;
        break;

      case z.ZodIssueCode.invalid_union:
        message = `${fieldName} has invalid format`;
        break;

      case z.ZodIssueCode.not_finite:
        message = `${fieldName} must be a finite number`;
        break;

      case z.ZodIssueCode.custom:
        message = issue.message || `${fieldName} is invalid`;
        break;

      default:
        message = `${fieldName}: ${ctx.defaultError}`;
    }

    return { message };
  });
};

export default z;

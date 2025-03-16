import { HTTP_METHOD } from 'next/dist/server/web/http';
import { ZodTypeAny } from 'zod';

export interface RequestConfig<
  T = Record<string, FormDataEntryValue | null>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _R = Record<string, unknown>,
> {
  url: string;
  method?: HTTP_METHOD;
  body?: T;
  validationSchema?: ZodTypeAny;
  headers?: Record<string, string>;
  errorDefaultMessage?: string;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
  };
}

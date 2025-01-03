import { ApiResponse } from '@/interfaces/api-response.interface';
import { AxiosError, AxiosInstance } from 'axios';
import { ZodTypeAny } from 'zod';
import { verifyZodFields } from './validation';
import { fetchAuth } from './fetch-auth';
import { BACKEND_URL } from '@/constants/constants';

interface RequestParams {
  axiosInstance: AxiosInstance;
  path: string;
  errorDefaultMessage?: string;
  onError?: () => void;
  beforeReq?: () => void;
  afterReq?: () => void;
}

interface PostReqParams extends RequestParams {
  data: Record<string, FormDataEntryValue | null>;
  validationSchema?: ZodTypeAny;
}

export const getReq = async ({
  path,
  errorDefaultMessage,
  onError,
  beforeReq,
  afterReq,
}: RequestParams) => {
  try {
    if (beforeReq) beforeReq();
    const response = await fetchAuth({
      url: BACKEND_URL + path,
    });
    if (afterReq) afterReq();
    return response;
  } catch (error: unknown) {
    handleRequestError(error, errorDefaultMessage, onError);
  }
};

export const postReq = async ({
  axiosInstance,
  path,
  data,
  validationSchema,
  errorDefaultMessage = 'Failed to perform the request.',
  onError,
  beforeReq,
  afterReq,
}: PostReqParams) => {
  try {
    if (beforeReq) beforeReq();

    // Validate if schema exists
    if (validationSchema) {
      const validationResult = await verifyZodFields(validationSchema, data);
      if (!validationResult.success) {
        return validationResult;
      }
      data = validationResult.data;
    }

    const response = await axiosInstance.post(path, data);

    if (afterReq) afterReq();

    return response.data;
  } catch (error: unknown) {
    console.log('Error from post req:', error);
    handleRequestError(error, errorDefaultMessage, onError);
  }
};

export const putReq = async ({
  axiosInstance,
  path,
  data,
  validationSchema,
  errorDefaultMessage,
  onError,
  beforeReq,
  afterReq,
}: PostReqParams) => {
  try {
    if (beforeReq) beforeReq();
    // Validate if schema exists
    if (validationSchema) {
      const validationResult = await verifyZodFields(validationSchema, data);
      if (!validationResult.success) {
        return validationResult;
      }
      data = validationResult.data;
    }

    const response = await axiosInstance.post(path, data);

    if (afterReq) afterReq();

    return response.data;
  } catch (error: unknown) {
    handleRequestError(error, errorDefaultMessage, onError);
  }
};

export const deleteReq = async ({
  axiosInstance,
  path,
  errorDefaultMessage,
  onError,
  beforeReq,
  afterReq,
}: RequestParams) => {
  try {
    if (beforeReq) beforeReq();
    const response = await axiosInstance.delete(path);
    if (afterReq) afterReq();
    return response.data;
  } catch (error: unknown) {
    handleRequestError(error, errorDefaultMessage, onError);
  }
};

export const handleRequestError = (
  error: unknown,
  defaultMessage?: string,
  onError?: (error: unknown) => void,
) => {
  if (onError) onError(error);

  if (error instanceof AxiosError) {
    // Get the error response data
    const errorData = error.response?.data as ApiResponse | undefined;

    // If we have a structured error response, use it
    if (errorData) {
      throw {
        message: errorData.message || defaultMessage,
        errors: errorData.errors,
        status: error.response?.status,
        path: errorData.path,
        timestamp: errorData.timestamp,
      };
    }

    // If no structured response, throw with status
    throw {
      message: error.message || defaultMessage,
      status: error.response?.status,
    };
  }

  // For non-Axios errors
  if (error instanceof Error) {
    throw {
      message: error.message || defaultMessage,
      status: 500,
    };
  }

  // For unknown errors
  throw {
    message: defaultMessage,
    status: 500,
  };
};

// ----------------------------------------------------------------

export const makeReq = (axiosInstance: AxiosInstance) => ({
  /**
   * GET request handler.
   * @param path - The endpoint path.
   * @param beforeReq - Optional callback before the request is made.
   * @param afterReq - Optional callback after the request is made.
   * @param errorDefaultMessage - Default error message for unexpected errors.
   * @param onError - Optional callback for additional error handling.
   * @returns A function that performs the GET request and returns the response data.
   */
  get:
    (
      path: string,
      beforeReq?: () => void,
      afterReq?: () => void,
      errorDefaultMessage?: string,
      onError?: () => void,
    ) =>
    async (): Promise<unknown> => {
      try {
        if (beforeReq) beforeReq();
        const response = await axiosInstance.get(path);
        if (afterReq) afterReq();
        return response.data;
      } catch (error: unknown) {
        handleRequestError(error, errorDefaultMessage, onError);
      }
    },

  /**
   * POST request handler.
   * @param path - The endpoint path.
   * @param data - The request payload.
   * @param beforeReq - Optional callback before the request is made.
   * @param afterReq - Optional callback after the request is made.
   * @param errorDefaultMessage - Default error message for unexpected errors.
   * @param onError - Optional callback for additional error handling.
   * @returns A function that performs the POST request and returns the response data.
   */
  post:
    (
      path: string,
      data: Record<string, unknown>,
      beforeReq?: () => void,
      afterReq?: () => void,
      errorDefaultMessage?: string,
      onError?: () => void,
    ) =>
    async (): Promise<unknown> => {
      try {
        if (beforeReq) beforeReq();
        const response = await axiosInstance.post(path, data);
        if (afterReq) afterReq();
        return response.data;
      } catch (error: unknown) {
        handleRequestError(error, errorDefaultMessage, onError);
      }
    },

  /**
   * PUT request handler.
   * @param path - The endpoint path.
   * @param data - The request payload.
   * @param errorDefaultMessage - Default error message for unexpected errors.
   * @param onError - Optional callback for additional error handling.
   * @returns A function that performs the PUT request and returns the response data.
   */
  put:
    (
      path: string,
      data: Record<string, unknown>,
      errorDefaultMessage?: string,
      onError?: () => void,
    ) =>
    async (): Promise<unknown> => {
      try {
        const response = await axiosInstance.put(path, data);
        return response.data;
      } catch (error: unknown) {
        handleRequestError(error, errorDefaultMessage, onError);
      }
    },

  /**
   * DELETE request handler.
   * @param path - The endpoint path.
   * @param errorDefaultMessage - Default error message for unexpected errors.
   * @param onError - Optional callback for additional error handling.
   * @returns A function that performs the DELETE request and returns the response data.
   */
  delete:
    (path: string, errorDefaultMessage?: string, onError?: () => void) =>
    async (): Promise<unknown> => {
      try {
        const response = await axiosInstance.delete(path);
        return response.data;
      } catch (error: unknown) {
        handleRequestError(error, errorDefaultMessage, onError);
      }
    },
});

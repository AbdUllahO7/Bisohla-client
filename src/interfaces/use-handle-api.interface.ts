import ApiResponse from './api-response.interface';

export default interface UseHandleApi {
  onSuccess: (res: ApiResponse) => void;
  onError: (error: Error) => void;
}

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';

export interface IBaseRepo<S, C, U> {
  findById(id: number): Promise<ApiResponse<S>>;
  search(params: QueryParams): Promise<PaginatedResponse<S>>;
  findAll(params: QueryParams): Promise<PaginatedResponse<S>>;
  create(createDto: C): Promise<ApiResponse<S>>;
  update(id: number, updateDto: U): Promise<ApiResponse<S>>;
  delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>>;
  seed(items: S[]): Promise<void>;
  reset(): Promise<void>;
}

import { IBaseRepo } from '@/core/application/strategies/repo.strategy';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  deleteAuthReq,
  getAuthReq,
  postAuthReq,
  putAuthReq,
} from '@/core/lib/api';

export class BaseRepo<
  S,
  C extends Record<string, unknown>,
  U extends Record<string, unknown>,
> implements IBaseRepo<S, C, U>
{
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async seed(items: S[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async findById(id: number): Promise<ApiResponse<S>> {
    const res = await getAuthReq<Record<string, unknown>, PaginatedResponse<S>>(
      {
        url: '/' + this.path + '/' + id,
      },
    );

    return res;
  }
  async findAll(params: QueryParams): Promise<PaginatedResponse<S>> {
    console.log('find all');
    const res = await getAuthReq<Record<string, unknown>, S>({
      url: '/' + this.path,
      params: params,
    });

    return res;
  }
  async create(createDto: C): Promise<ApiResponse<S>> {
    const res = await postAuthReq<C, S>({
      url: '/' + this.path,
      body: createDto,
    });

    return res;
  }
  async update(id: number, updateDto: U): Promise<ApiResponse<S>> {
    const res = await putAuthReq<U, S>({
      url: '/' + this.path + '/' + id,
      body: updateDto,
    });

    return res;
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await deleteAuthReq({
      url: '/' + this.path + '/' + id,
    });

    return res;
  }
}

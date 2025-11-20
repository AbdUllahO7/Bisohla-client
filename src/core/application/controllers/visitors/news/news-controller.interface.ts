import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';

// This is the interface the new controller will implement
export interface INewsVisitorController {
  findNewsArticles(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsArticleDto>>;

  findNewsArticleById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsArticleDto>>;

  findNewsArticleBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsArticleDto>>;

  findNewsCategories(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsCategoryDto>>;

  findNewsCategoryById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsCategoryDto>>;

  findNewsCategoryBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsCategoryDto>>;
}
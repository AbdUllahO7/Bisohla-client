import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';

export interface INewsVisitorStrategy {
  /**
   * Finds published news articles based on query parameters.
   * Corresponds to: GET /api/v1/news-public
   */
  findNewsArticles(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsArticleDto>>;

  /**
   * Finds a single published news article by its ID.
   * Corresponds to: GET /api/v1/news-public/{id}
   */
  findNewsArticleById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsArticleDto>>;

  /**
   * Finds a single published news article by its slug.
   * Corresponds to: GET /api/v1/news-public/slug/{slug}
   */
  findNewsArticleBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsArticleDto>>;

  /**
   * Finds news categories based on query parameters.
   * Corresponds to: GET /api/v1/news-categories-public
   */
  findNewsCategories(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsCategoryDto>>;

  /**
   * Finds a single news category by its ID.
   * Corresponds to: GET /api/v1/news-categories-public/{id}
   */
  findNewsCategoryById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsCategoryDto>>;

  /**
   * Finds a single news category by its slug.
   * Corresponds to: GET /api/v1/news-categories-public/slug/{slug}
   */
  findNewsCategoryBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsCategoryDto>>;
}
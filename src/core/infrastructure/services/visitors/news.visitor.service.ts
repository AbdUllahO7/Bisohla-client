import { INewsVisitorStrategy } from '@/core/application/strategies/visitors/news.visitor.strategy.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';
import { getReq } from '@/core/lib/api';

export class NewsVisitorService implements INewsVisitorStrategy {
  
  async findNewsArticles(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsArticleDto>> {
    const res = await getReq<
      Record<string, unknown>,
      PaginatedResponse<SelectNewsArticleDto>
    >({
      url: '/news-public',
      params: queryParams,
    });
    return res;
  }

  async findNewsArticleById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    const { id, ...otherParams } = queryParams;
    const res = await getReq<
      Record<string, unknown>,
      ApiResponse<SelectNewsArticleDto>
    >({
      url: `/news-public/${id}`,
      params: otherParams,
    });
    return res;
  }

  async findNewsArticleBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    const { slug, ...otherParams } = queryParams;
    const res = await getReq<
      Record<string, unknown>,
      ApiResponse<SelectNewsArticleDto>
    >({
      url: `/news-public/slug/${slug}`,
      params: otherParams,
    });
    return res;
  }

  async findNewsCategories(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsCategoryDto>> {
    const res = await getReq<
      Record<string, unknown>,
      PaginatedResponse<SelectNewsCategoryDto>
    >({
      url: '/news-categories-public',
      params: queryParams,
    });
    return res;
  }

  async findNewsCategoryById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    const { id, ...otherParams } = queryParams;
    const res = await getReq<
      Record<string, unknown>,
      ApiResponse<SelectNewsCategoryDto>
    >({
      url: `/news-categories-public/${id}`,
      params: otherParams,
    });
    return res;
  }

  async findNewsCategoryBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    const { slug, ...otherParams } = queryParams;
    const res = await getReq<
      Record<string, unknown>,
      ApiResponse<SelectNewsCategoryDto>
    >({
      url: `/news-categories-public/slug/${slug}`,
      params: otherParams,
    });
    return res;
  }
}
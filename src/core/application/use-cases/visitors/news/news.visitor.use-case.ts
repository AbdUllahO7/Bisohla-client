import { INewsVisitorStrategy } from '@/core/application/strategies/visitors/news.visitor.strategy.interface';
import { INewsVisitorUseCase } from './news.visitor.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';

// No @injectable()
export class NewsVisitorUseCase implements INewsVisitorUseCase {
  
  // Dependency is passed via constructor from the module
  constructor(
    private readonly newsStrategy: INewsVisitorStrategy,
  ) {}

  findNewsArticles(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsArticleDto>> {
    return this.newsStrategy.findNewsArticles(queryParams);
  }

  findNewsArticleById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    return this.newsStrategy.findNewsArticleById(queryParams);
  }

  findNewsArticleBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    return this.newsStrategy.findNewsArticleBySlug(queryParams);
  }

  findNewsCategories(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsCategoryDto>> {
    return this.newsStrategy.findNewsCategories(queryParams);
  }

  findNewsCategoryById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    return this.newsStrategy.findNewsCategoryById(queryParams);
  }

  findNewsCategoryBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    return this.newsStrategy.findNewsCategoryBySlug(queryParams);
  }
}
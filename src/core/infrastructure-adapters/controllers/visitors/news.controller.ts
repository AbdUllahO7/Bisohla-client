import { INewsVisitorController } from '@/core/application/controllers/visitors/news/news-controller.interface';
import { INewsVisitorUseCase } from '@/core/application/use-cases/visitors/news/news.visitor.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';
import { catchClientRequest } from '@/core/lib/error';

export class NewsVisitorController implements INewsVisitorController {
  
  // Dependency is passed via constructor from the module
  constructor(private readonly newsUseCase: INewsVisitorUseCase) {}

  async findNewsArticles(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsArticleDto>> {
    try {
      return await this.newsUseCase.findNewsArticles(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async findNewsArticleById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    try {
      return await this.newsUseCase.findNewsArticleById(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async findNewsArticleBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsArticleDto>> {
    try {
      return await this.newsUseCase.findNewsArticleBySlug(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async findNewsCategories(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectNewsCategoryDto>> {
    try {
      return await this.newsUseCase.findNewsCategories(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async findNewsCategoryById(
    queryParams: QueryParams & { id: number },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    try {
      return await this.newsUseCase.findNewsCategoryById(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async findNewsCategoryBySlug(
    queryParams: QueryParams & { slug: string },
  ): Promise<ApiResponse<SelectNewsCategoryDto>> {
    try {
      return await this.newsUseCase.findNewsCategoryBySlug(queryParams);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
}
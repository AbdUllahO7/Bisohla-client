'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';
import { getInjection } from '@/di/container'; // Assuming DI setup

export const getNewsArticles = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectNewsArticleDto>> => {
  // Use the controller injection pattern from your 'cars' file
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsArticles(params);
  return res;
};

export const getNewsArticleById = async (
  params: QueryParams & { id: number },
): Promise<ApiResponse<SelectNewsArticleDto>> => {
  // Use the controller injection pattern
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsArticleById(params);
  return res;
};

export const getNewsArticleBySlug = async (
  params: QueryParams & { slug: string },
): Promise<ApiResponse<SelectNewsArticleDto>> => {
  // Use the controller injection pattern
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsArticleBySlug(params);
  return res;
};

export const getNewsCategories = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectNewsCategoryDto>> => {
  // Use the controller injection pattern
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsCategories(params);
  return res;
};

export const getNewsCategoryById = async (
  params: QueryParams & { id: number },
): Promise<ApiResponse<SelectNewsCategoryDto>> => {
  // Use the controller injection pattern
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsCategoryById(params);
  return res;
};

export const getNewsCategoryBySlug = async (
  params: QueryParams & { slug: string },
): Promise<ApiResponse<SelectNewsCategoryDto>> => {
  // Use the controller injection pattern
  const newsController = getInjection('INewsVisitorController');
  const res = await newsController.findNewsCategoryBySlug(params);
  return res;
};
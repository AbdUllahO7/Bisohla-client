'use client';

import { QueryParams } from '@/core/entities/api/api';
import {
  getNewsArticleById,
  getNewsArticleBySlug,
  getNewsArticles,
  getNewsCategories,
  getNewsCategoryById,
  getNewsCategoryBySlug,
} from '@/core/infrastructure-adapters/actions/visitors/news.visitor.actions';
import { useQuery } from '@tanstack/react-query';

// Hook to get a paginated list of news articles
export const useGetNewsArticles = (
  params: QueryParams,
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsArticles', params],
    queryFn: () => getNewsArticles(params),
    enabled: options.enabled,
  });

// Hook to get a single news article by its ID
export const useGetNewsArticleById = (
  params: QueryParams & { id: number },
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsArticle', 'id', params.id, params.locale],
    queryFn: () => getNewsArticleById(params),
    enabled: !!params.id && options.enabled,
  });

// Hook to get a single news article by its slug
export const useGetNewsArticleBySlug = (
  params: QueryParams & { slug: string },
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsArticle', 'slug', params.slug, params.locale],
    queryFn: () => getNewsArticleBySlug(params),
    enabled: !!params.slug && options.enabled,
  });

// Hook to get a paginated list of news categories
export const useGetNewsCategories = (
  params: QueryParams,
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsCategories', params],
    queryFn: () => getNewsCategories(params),
    enabled: options.enabled,
  });

// Hook to get a single news category by its ID
export const useGetNewsCategoryById = (
  params: QueryParams & { id: number },
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsCategory', 'id', params.id, params.locale],
    queryFn: () => getNewsCategoryById(params),
    enabled: !!params.id && options.enabled,
  });

// Hook to get a single news category by its slug
export const useGetNewsCategoryBySlug = (
  params: QueryParams & { slug: string },
  options: { enabled?: boolean } = { enabled: true },
) =>
  useQuery({
    queryKey: ['newsCategory', 'slug', params.slug, params.locale],
    queryFn: () => getNewsCategoryBySlug(params),
    enabled: !!params.slug && options.enabled,
  });
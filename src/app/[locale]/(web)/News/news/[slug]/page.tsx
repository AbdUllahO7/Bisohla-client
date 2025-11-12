import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

import {
  getNewsArticleBySlug as getNewsArticleBySlugForVisitor,
  getNewsArticles as getNewsArticlesForVisitor,
} from '@/core/infrastructure-adapters/actions/visitors/news.visitor.actions';
import { NewsDetailClient } from '@/components/web/design/NewsDetailClient';
import type { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';

type ArticleWithRelations = SelectNewsArticleDto & {
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; name: string; email: string; profileUrl: string | null } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params; // ✅ await params here

  const articleResponse = await getNewsArticleBySlugForVisitor({ slug, locale });

  if (!articleResponse.success || !articleResponse.data) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    };
  }

  const article = articleResponse.data as ArticleWithRelations;
  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || '';
  const imageUrl = article.coverImage || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt || article.createdAt,
      authors: [article.author?.name || ''],
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug, locale } = await params; // ✅ await params
  const resolvedSearchParams = await searchParams;

  const articleResponse = await getNewsArticleBySlugForVisitor({ slug, locale });
  if (!articleResponse.success || !articleResponse.data) {
    notFound();
  }

  const article = articleResponse.data as ArticleWithRelations;
  let relatedArticles: ArticleWithRelations[] = [];

  if (article.categoryId) {
    const related = await getNewsArticlesForVisitor({
      page: 1,
      pageSize: 4,
      locale,
      sortBy: 'publishedAt',
      sortDirection: 'desc',
      where: [{ field: 'categoryId', operator: 'eq', value: article.categoryId }],
    });
    if (related.success && related.data) {
      relatedArticles = (related.data.data as ArticleWithRelations[])
        .filter((a) => a.id !== article.id)
        .slice(0, 3);
    }
  }

  return <NewsDetailClient article={article} relatedArticles={relatedArticles} />;
}

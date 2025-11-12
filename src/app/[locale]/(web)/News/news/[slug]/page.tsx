'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Calendar, 
  Eye, 
  User, 
  Tag, 
  Clock, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  ArrowLeft,
  Newspaper,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useGetNewsArticleBySlug, useGetNewsArticles } from '@/hooks/use-news';
import NewsCard from '@/components/web/Home/NewsCard';
import type { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';

// Extended type for article with relations
type ArticleWithRelations = SelectNewsArticleDto & {
  category?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  author?: {
    id: number;
    name: string;
    email: string;
    profileUrl: string | null;
    phone?: string | null;
    verifiedAt?: string | null;
    lang?: string | null;
    provider?: string | null;
    providerId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

const NewsDetailPage: React.FC = () => {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('newsDetails');
  const slug = params?.slug as string;

  // Fetch the article by slug
  const { data: articleData, isLoading } = useGetNewsArticleBySlug({
    slug,
    locale,
  });

  // Cast to extended type with relations
  const article = articleData?.data as ArticleWithRelations | undefined;

  // Fetch related articles (same category)
  const { data: relatedArticlesData } = useGetNewsArticles({
    page: 1,
    pageSize: 4, // Fetch 4 to ensure we have 3 after filtering
    locale,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
    ...(article?.categoryId && {
      where: [{ field: 'categoryId', operator: 'eq', value: article.categoryId }],
    }),
  }, { enabled: !!article?.categoryId });

  const relatedArticles = (relatedArticlesData?.data?.data as ArticleWithRelations[] | undefined)
    ?.filter((a) => a.id !== article?.id)
    .slice(0, 3); // Take only 3 articles

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} ${t('minRead')}`;
  };

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Get author and category info with fallback to related articles
  const authorInfo = article?.author || 
    (relatedArticlesData?.data?.data as ArticleWithRelations[] | undefined)?.find(
      (a) => a.authorId === article?.authorId && a.author
    )?.author;

  const categoryInfo = article?.category || 
    (relatedArticlesData?.data?.data as ArticleWithRelations[] | undefined)?.find(
      (a) => a.categoryId === article?.categoryId && a.category
    )?.category;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl"></div>
            <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-xl w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Box variant="column" className="items-center text-center p-12">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Newspaper className="w-16 h-16 text-gray-400" />
          </div>
          <Text className="text-3xl font-bold text-gray-700 mb-4">
            {t('articleNotFound')}
          </Text>
          <Link href={`/${locale}/news`}>
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              {t('backToNews')}
            </button>
          </Link>
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Cover Image */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Cover Image */}
        <div className="absolute inset-0">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center">
              <Newspaper className="w-32 h-32 text-white/30" />
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-12 max-w-5xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-white/80 mb-6 animate-fadeIn">
              <Link href={`/${locale}`} className="hover:text-white transition-colors">
                {t('home')}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/${locale}/news`} className="hover:text-white transition-colors">
                {t('news')}
              </Link>
              {categoryInfo && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-primary-foreground">{categoryInfo.name}</span>
                </>
              )}
            </div>

            {/* Category Badge */}
            {categoryInfo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 backdrop-blur-md rounded-full mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-semibold text-white">
                  {categoryInfo.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subTitle && (
              <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                {article.subTitle}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/80 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              {/* Author */}
              {authorInfo && (
                <>
                  <div className="flex items-center gap-3">
                    {authorInfo.profileUrl ? (
                      <Image
                        src={authorInfo.profileUrl}
                        alt={authorInfo.name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/20">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <Text className="text-sm text-white/60">{t('by')}</Text>
                      <Text className="font-semibold text-white">{authorInfo.name}</Text>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                </>
              )}

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <Text className="font-medium">{formatDate(article.publishedAt || article.createdAt)}</Text>
              </div>

              <div className="h-8 w-px bg-white/20"></div>

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <Text className="font-medium">{getReadingTime(article.content)}</Text>
              </div>

              <div className="h-8 w-px bg-white/20"></div>

              {/* View Count */}
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <Text className="font-medium">{article.viewCount?.toLocaleString() || 0} {t('views')}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-white via-gray-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Share Buttons - Sticky */}
          <div className="hidden lg:block fixed left-8 top-1/2 transform -translate-y-1/2 z-20">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 space-y-4 border border-gray-100">
              <Text className="text-xs font-semibold text-gray-600 text-center mb-2">{t('share')}</Text>
              <button
                onClick={() => shareOnSocial('facebook')}
                className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => shareOnSocial('twitter')}
                className="w-12 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="w-12 h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Content Card */}
          <div className="group relative mb-12 animate-fadeIn">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
              {/* Excerpt */}
              {article.excerpt && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary-light/5 border-l-4 border-primary">
                  <Text className="text-lg text-gray-700 italic leading-relaxed">
                    {article.excerpt}
                  </Text>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-2xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="w-5 h-5 text-primary" />
                    <Text className="font-bold text-gray-900">{t('tags')}</Text>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 text-primary rounded-xl font-semibold text-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Share Buttons */}
          <div className="lg:hidden mb-12 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100">
              <Text className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                {t('shareArticle')}
              </Text>
              <div className="flex gap-4">
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('linkedin')}
                  className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Author Card */}
          {authorInfo && (
            <div className="group relative mb-12 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100">
                <Text className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>
                  {t('aboutAuthor')}
                </Text>
                <div className="flex items-start gap-6">
                  {authorInfo.profileUrl ? (
                    <Image
                      src={authorInfo.profileUrl}
                      alt={authorInfo.name}
                      width={80}
                      height={80}
                      className="rounded-2xl border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                      {authorInfo.name}
                    </Text>
                    {authorInfo.email && (
                      <Text className="text-gray-600">
                        {authorInfo.email}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <Text className="font-bold text-3xl text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-1 h-10 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>
                {t('relatedArticles')}
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <NewsCard key={relatedArticle.id} article={relatedArticle as SelectNewsArticleDto} />
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-center pt-12 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link href={`/${locale}/News`}>
              <button className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                <ArrowLeft className="w-5 h-5 relative transform group-hover/btn:-translate-x-1 transition-transform" />
                <span className="relative">{t('backToAllNews')}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default NewsDetailPage;
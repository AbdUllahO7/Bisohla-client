'use client';

import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import 'quill/dist/quill.snow.css';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
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
  Newspaper,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import NewsCard from '@/components/web/Home/NewsCard';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';
import { cn } from '@/lib/utils';
import { useDirection } from '@/hooks/use-direction';
import AdSpace from '@/components/ads/AdSpace';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import CardAds from '@/components/web/design/CardAds';
import { useAdSlot } from '@/hooks/use-ad-slot';

// Extended type for article with relations
type ArticleWithRelations = SelectNewsArticleDto & {
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  author?: {
    id: number;
    name: string;
    email: string;
    profileUrl: string | null;
  } | null;
};

// Props for the client component
interface NewsDetailClientProps {
  article: ArticleWithRelations;
  relatedArticles: ArticleWithRelations[];
}

export const NewsDetailClient: React.FC<NewsDetailClientProps> = ({
  article,
  relatedArticles,
}) => {
  const locale = useLocale();
  const t = useTranslations('newsDetails');
  const direction = useDirection();
  const { adsData, isLoadingAds, allowPlaceholders, dismissable, rotationStrategy } = useAdSlot('details-news-page-ad-space-card');

  // Data is now passed as props, no need for isLoading or data-fetching hooks

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
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Get author and category info
  // These are now directly available on the 'article' prop
  const authorInfo = article.author;
  const categoryInfo = article.category;

  // Not found state is handled by the server component, but as a fallback:
  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <Box variant="column" className="items-center text-center p-12">
          <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
            <Newspaper className="w-16 h-16 text-gray-400 dark:text-zinc-650" />
          </div>
          <Text className="text-3xl font-bold text-gray-700 dark:text-zinc-300 mb-4">
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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
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
              <Link
                href={`/${locale}`}
                className="hover:text-white transition-colors"
              >
                {t('home')}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/${locale}/news`}
                className="hover:text-white transition-colors"
              >
                {t('news')}
              </Link>
              {categoryInfo && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-primary-foreground">
                    {categoryInfo.name}
                  </span>
                </>
              )}
            </div>

            {/* Category Badge */}
            {categoryInfo && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 backdrop-blur-md rounded-full mb-6 animate-fadeIn"
                style={{ animationDelay: '0.1s' }}
              >
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-semibold text-white">
                  {categoryInfo.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subTitle && (
              <p
                className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn"
                style={{ animationDelay: '0.3s' }}
              >
                {article.subTitle}
              </p>
            )}

            {/* Meta Info */}
            <div
              className="flex flex-wrap items-center gap-6 text-white/80 animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
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
                      <Text className="font-semibold text-white">
                        {authorInfo.name}
                      </Text>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                </>
              )}

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <Text className="font-medium">
                  {formatDate(article.publishedAt || article.createdAt)}
                </Text>
              </div>

              <div className="h-8 w-px bg-white/20"></div>

              {/* Reading Time */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <Text className="font-medium">
                  {getReadingTime(article.content)}
                </Text>
              </div>

              <div className="h-8 w-px bg-white/20"></div>

              {/* View Count */}
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <Text className="font-medium">
                  {article.viewCount?.toLocaleString() || 0} {t('views')}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-white via-gray-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-16">
        {/* // -------------------------------------------------------------------
        // LAYOUT CHANGE: Widen container and apply grid
        // -------------------------------------------------------------------
        */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
            {/* --- Main Content Column --- */}
            <div className="lg:col-span-8">
              {/* Share Buttons - Sticky */}
              <div className="hidden lg:block fixed left-8 top-1/2 transform -translate-y-1/2 z-20">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 space-y-4 border border-gray-100 dark:border-zinc-800">
                  <Text className="text-xs font-semibold text-gray-600 dark:text-zinc-400 text-center mb-2">
                    {t('share')}
                  </Text>
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
              <div className="group relative mb-12 animate-fadeIn ql-snow">
                {' '}
                {/* <-- أضف ql-snow هنا */}
                <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-zinc-800">
                  {/* Excerpt */}
                  {article.excerpt && (
                    <div
                      className={cn(
                        'mb-8 p-6  border-primary',
                        direction === 'rtl' ? 'border-r-4' : 'border-l-4',
                      )}
                    >
                      <Text className="text-lg text-gray-700 dark:text-zinc-300 leading-relaxed">
                        {article.excerpt}
                      </Text>
                    </div>
                  )}

                  <div
                    className="rich-text-content ql-editor overflwo-y-visible dark:text-zinc-200"
                    style={{
                      overflowY: 'visible',
                    }}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t-2 border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Tag className="w-5 h-5 text-primary" />
                        <Text className="font-bold text-gray-900 dark:text-zinc-100">
                          {t('tags')}
                        </Text>
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
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-zinc-800">
                  <Text className="font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
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
                <div
                  className="group relative mb-12 animate-fadeIn"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800">
                    <Text className="font-bold text-2xl text-gray-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
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
                          className="rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-lg">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                          {authorInfo.name}
                        </Text>
                        {authorInfo.email && (
                          <Text className="text-gray-600 dark:text-zinc-400">
                            {authorInfo.email}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div
                className="flex justify-center pt-12 animate-fadeIn"
                style={{ animationDelay: '0.3s' }}
              >
                <Link href={`/${locale}/news`}>
                  <button className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <ArrowLeft className="w-5 h-5 relative transform group-hover/btn:-translate-x-1 transition-transform" />
                    <span className="relative">{t('backToAllNews')}</span>
                  </button>
                </Link>
              </div>
            </div>

            <aside className="mt-8 lg:mt-0 lg:col-span-4 lg:top-24 h-fit">
              {relatedArticles && relatedArticles.length > 0 && (
                <div
                  className="animate-fadeIn"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex gap-2 justify-center lg:justify-start">
                    <div className="w-1 h-10 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>

                    <Text className="font-bold text-3xl text-gray-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
                      {t('relatedArticles')}
                    </Text>
                  </div>

                  {/* --- BEGIN MODIFICATION --- */}
                  <div className="flex flex-col gap-6">
                    {' '}
                    {/* Keep flex-col for the sidebar stack of cards */}
                    {relatedArticles.map((relatedArticle) => (
                      // We'll pass a prop to NewsCard to tell it to render horizontally
                      <NewsCard
                        key={relatedArticle.id}
                        article={relatedArticle as SelectNewsArticleDto}
                        variant="horizontal"
                      />
                    ))}
                  </div>

                  {/* Sidebar Ad Slot */}
                  <div className="mt-8">
                    <AdSpace
                      name="details-news-page-ad-space-card"
                      className="w-full h-full"
                      wrapperClassName="w-full h-full min-h-[380px]"
                      fallbackContent={<CardAds isRent={false} />}
                      isClosable={false}
                      adsData={adsData}
                      isLoadingAds={isLoadingAds}
                      allowPlaceholders={allowPlaceholders}
                      dismissable={dismissable}
                      rotationStrategy={rotationStrategy}
                      layout="card"
                    />
                  </div>
                  {/* --- END MODIFICATION --- */}
                </div>
              )}
            </aside>
          </div>{' '}
          {/* --- End Grid --- */}
        </div>{' '}
        {/* --- End Container --- */}

        {/* Full-width bottom ad */}
        <div className="mt-16 border-t container border-gray-100 dark:border-zinc-800 pt-16">
          <AdsSectionProduct name="news details page bottom full width ad" layout="banner" />
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

        /* * الآن ملف quill.snow.css سيتولى تنسيق الخطوط والأحجام.
         * نحن فقط نعطيه بعض التعديلات ليعمل بدون إطار (border).
        */
        .rich-text-content.ql-editor {
          /* هذا يضمن أن الحاوية ليس لها حدود أو إطارات ويستخدم التنسيقات الافتراضية */
          border: none !important;
          padding: 0 !important;
        }

        /* * هذه الكلاسات موجودة بالفعل في quill.snow.css
         * لكننا نؤكد عليها لضمان دعم RTL
        */
        .rich-text-content .ql-align-right {
          text-align: right;
        }
        .rich-text-content .ql-direction-rtl {
          direction: rtl;
        }

        .rich-text-content .ql-direction-rtl ol,
        .rich-text-content .ql-direction-rtl ul {
          padding-left: 0;
          padding-right: 2em; /* RTL list padding */
        }
      `}</style>
    </div>
  );
};

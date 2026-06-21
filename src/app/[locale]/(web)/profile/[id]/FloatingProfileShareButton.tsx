'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Link2,
  X,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FloatingProfileShareButtonProps {
  profileName: string;
  profileUrl?: string;
  onShare?: () => void;
  isSharePending?: boolean;
}

const FloatingProfileShareButton: React.FC<FloatingProfileShareButtonProps> = ({
  profileName,
  profileUrl,
  onShare,
  isSharePending = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const t = useTranslations('productHeader');
  const tProfile = useTranslations('publicProfile');

  // Get the current URL or use provided URL
  const shareUrl = profileUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);

  // Generate a rich WhatsApp message for profile
  const generateWhatsAppMessage = () => {
    let message = `👤 *${profileName}*\n\n`;
    message += `🔗 *رابط الملف الشخصي / Profile Link:*\n${shareUrl}\n\n`;
    message += `✨ شاهد جميع الإعلانات والمنتجات!\n`;
    message += `✨ Check out all listings and products!`;

    return encodeURIComponent(message);
  };

  // Copy link to clipboard and show Facebook sharer
  const handleFacebookShare = async () => {
    try {
      // First, copy the link to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Track the share
      handleShare('facebook', () => {
        // Open Facebook sharer
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
      });

      // Show a brief notification that link was copied
      const originalMessage = showCopiedMessage;
      setShowCopiedMessage(true);
      setTimeout(() => {
        setShowCopiedMessage(originalMessage);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Still open Facebook even if copy fails
      handleShare('facebook', () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
      });
    }
  };

  // Track share and perform action
  const handleShare = (platform: string, action: () => void) => {
    // Track share count if callback is provided
    if (onShare) {
      onShare();
    }

    // Perform the share action
    action();

    // Close the menu after sharing
    setTimeout(() => setIsOpen(false), 300);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);

      // Track the share
      handleShare('copy_link', () => {});

      // Hide message after 2 seconds
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  // Native share (if available)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileName,
          text: `Check out this profile: ${profileName}`,
          url: shareUrl,
        });

        if (onShare) {
          onShare();
        }
      } catch (error) {
        console.error('Native share failed:', error);
      }
    }
  };

  // Social media share handlers
  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600',
      action: handleFacebookShare,
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'hover:bg-pink-600',
      action: () => {
        handleShare('instagram', async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
            alert(t('instagramCopyMessage', {
              defaultValue: 'Link copied! Open Instagram and paste the link in your story or post.'
            }));
          } catch (error) {
            alert(t('instagramShareMessage', {
              defaultValue: 'Copy this link and share it on Instagram:\n' + shareUrl
            }));
          }
        });
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-700',
      action: () => {
        handleShare('linkedin', () => {
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            '_blank',
            'width=600,height=400'
          );
        });
      },
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-600',
      action: () => {
        handleShare('whatsapp', () => {
          const whatsappMessage = generateWhatsAppMessage();
          window.open(
            `https://wa.me/?text=${whatsappMessage}`,
            '_blank',
            'width=600,height=400'
          );
        });
      },
    },
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-32 right-4 md:right-8 z-50">
        {/* Share Options Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-4 min-w-[280px] border border-gray-200 dark:border-zinc-800 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-zinc-200">{tProfile('share')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.name}
                    onClick={option.action}
                    className={`flex flex-col items-center justify-center h-20 bg-gray-50 dark:bg-zinc-800/50 dark:text-zinc-200 hover:text-white transition-all duration-300 ${option.color}`}
                    variant="outline"
                    disabled={isSharePending}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-xs">{option.name}</span>
                  </Button>
                );
              })}
            </div>

            {/* Copy Link Section */}
            <div className="border-t pt-4">
              <Button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                disabled={isSharePending}
              >
                {showCopiedMessage ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t('linkCopied')}</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    <span>{t('copyLink')}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Native Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <div className="mt-3">
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  className="w-full"
                  disabled={isSharePending}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('moreOptions')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Floating Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300 ${
            isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
          }`}
          disabled={isSharePending}
        >
          <Share2 className="h-6 w-6" />
        </Button>

        {/* Loading Indicator */}
        {isSharePending && (
          <div className="absolute -top-1 -right-1">
            <div className="h-4 w-4 bg-blue-500 rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FloatingProfileShareButton;

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

interface SellerInfoCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    profileUrl?: string | null;
    verifiedAt?: string | null;
    createdAt?: string;
    phone?: string | null;
  };
  isLoading?: boolean;
}

const SellerInfoCard: React.FC<SellerInfoCardProps> = ({
  user,
  isLoading = false,
}) => {
  const locale = useLocale();
  const t = useTranslations('product.sellerInfo');

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Simple seller info - just a clickable line with avatar */}
      <Link
        href={`/${locale}/profile/${user.id}`}
        className="flex items-center gap-3 p-3    transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10 border-2 border-gray-100 group-hover:border-[#198341]/30 transition-colors">
            <AvatarImage
              src={user.profileUrl || '/placeholder.svg'}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-sm bg-gray-100 text-gray-600">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {user.verifiedAt && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
              <CheckCircle2 className="h-3 w-3 text-[#198341]" />
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#198341] transition-colors font-cairo truncate">
              {user.name}
            </p>
            {user.verifiedAt && (
              <Badge
                variant="secondary"
                className="bg-[#198341]/10 text-[#198341] border-0 text-[10px] px-1.5 py-0 h-4"
              >
                {t('verified')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 font-cairo">{t('title')}</p>
        </div>

        {/* Arrow icon */}
        <User className="h-4 w-4 text-gray-400 group-hover:text-[#198341] transition-colors flex-shrink-0" />
      </Link>
    </div>
  );
};

export default SellerInfoCard;

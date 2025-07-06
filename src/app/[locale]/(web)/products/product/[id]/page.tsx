'use client';

import Box from "@/components/box/box"
import ProductBasicInfo from "@/components/web/ProductsPage/product/ProductBasicInfo"
import ProductHeader from "@/components/web/ProductsPage/product/ProductHeader"
import ProductImages from "@/components/web/ProductsPage/product/ProductImages"
import ProductInfo from "@/components/web/ProductsPage/product/ProductInfo"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import TabsSection from "@/components/web/ProductsPage/product/TabsSection"
import { useCarListingById } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions"
import { checkAuth } from "@/core/infrastructure-adapters/actions/auth/auth.actions"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useLocale } from "next-intl"
import { useSession } from "@/hooks/auth/use-session";
import { useMyCarById } from "@/core/infrastructure-adapters/use-actions/users/car.user.use-actions";

const Product = () => {
  const { id } = useParams(); // Get the product ID from the URL params
  const searchParams = useSearchParams(); // Get query parameters
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState(false);
  const locale = useLocale();
  const session = useSession();
  
  // Read the profile parameter from the URL query string
  const isProfileView = searchParams.get('profile') === 'true';

  // Call both hooks but we'll only use the data from the relevant one
  const visitorCarData = useCarListingById({
    id: Number(id),
    userId: session?.user?.id
  });

  const userCarData = useMyCarById(
    Number(id)
  );

  // Determine which data to use based on profile query parameter
  const { data, isLoading } = isProfileView ? userCarData : visitorCarData;

  // Verify authentication status on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authResponse = await checkAuth();
        setIsAuthenticated(authResponse.success);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Update favorite status when data is loaded
  useEffect(() => {
    if (data?.data?.isFavorite !== undefined) {
      setFavoriteStatus(data?.data?.isFavorite ?? false);
    }
  }, [data]);

  // Handle favorite toggle from child component
  const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
    setFavoriteStatus(isFavorite);
  };

  return (
    <div className="mt-[10px] bg-background w-full">
      <Box variant="container" className="w-full mb-4">
        <Breadcrumb dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <BreadcrumbList dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <BreadcrumbItem dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <BreadcrumbLink className="hover:text-black text-black" href="/">
                {locale === 'ar' ? 'الرئيسية' : 'Home'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator lang={locale === 'ar' ? 'ar' : 'en'} />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-primary hover:text-primary-light"
                href="/products"
              >
                {locale === 'ar' ? 'السيارات' : 'Cars'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator lang={locale === 'ar' ? 'ar' : 'en'} />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-primary hover:text-primary-light"
                href="#"
              >
                {locale === 'ar' ? data?.data?.title : data?.data?.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Box>

      <div className="w-full mb-3 bg-white">
        <Box variant="container">
          <ProductHeader
            productName={data?.data?.title}
            ContactNumber={data?.data?.contactNumber?.toString()}
            isLoading={isLoading}
            productId={Number(id)}
            isMarkedFavorite={favoriteStatus}
            isAuthenticated={isAuthenticated}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </Box>
      </div>

      <Box variant="container">
        {/* Product Details Section */}
        <Box className="mt-1 w-full mb-3">
          <ProductBasicInfo
            isLoading={isLoading}
            carType={data?.data?.make?.name || ''}
            model={data?.data?.model?.name || ''}
            controlType={data?.data?.details?.transmission || ''}
            distance={data?.data?.details?.mileage?.toString() || ''}
            modelYear={data?.data?.details?.year?.toString() || ''}
            gaz={data?.data?.details?.fuelType || ''}
            bodyType={data?.data?.details?.bodyType || ''}
          />
        </Box>

        {/* images  */}
        <Box className="w-full">
          <Box
            variant="row"
            className="w-full gap-4 items-start justify-start md:flex-wrap xs:flex-wrap xs:justify-center"
          >
            <Box className="xs:w-[90%] lg:w-fit">
              <ProductInfo
                isLoading={isLoading}
                carType={data?.data?.make?.name || ''}
                model={data?.data?.model?.name || ''}
                controlType={data?.data?.details?.transmission || ''}
                distance={data?.data?.details?.mileage?.toString() || ''}
                modelYear={data?.data?.details?.year?.toString() || ''}
                gaz={data?.data?.details?.fuelType || ''}
                price={data?.data?.price?.toString() || ''}
                adsNumber={data?.data?.id?.toString() || ''}
                adsDate={data?.data?.publishedAt?.toString() || ''}
              />
            </Box>

            <Box className="lg:flex-1 xs:w-full">
              <ProductImages
                isLoading={isLoading}
                images={data?.data?.images || []}
              />
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box className="lg:w-full xs:w-[90%] mt-5">
          <TabsSection data={data} isLoading={isLoading} />
        </Box>
      </Box>
    </div>
  );
};

export default Product;
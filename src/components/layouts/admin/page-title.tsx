import Box from '@/components/box/box';
import ContentCard from './content-card';
import Text from '@/components/text/text';
import BreadCrumbs from './bread-crumbs';

interface PageTitleProps {
  title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <ContentCard className="-mt-12">
      <Box className="w-full justify-between">
        <Text variant="h3" className="uppercase font-bold">
          {title}
        </Text>
        <BreadCrumbs />
      </Box>
    </ContentCard>
  );
};

export default PageTitle;

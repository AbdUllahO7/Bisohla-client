import Box from '@/components/box/box';
import ContentCard from '@/components/layouts/admin/content-card';
import PageTitle from '@/components/layouts/admin/page-title';
import Text from '@/components/text/text';
import { getTranslations } from 'next-intl/server';
import { getRoles } from '../actions';

const AdminRolesListPage = async () => {
  const t = await getTranslations('adminPage.rolesListPage');
  const roles = await getRoles();
  return (
    <Box variant="container">
      <Box variant="column" className="w-full gp-12">
        <PageTitle title={t('title')} />
        <ContentCard>
          <Text>test</Text>
        </ContentCard>
      </Box>
    </Box>
  );
};

export default AdminRolesListPage;

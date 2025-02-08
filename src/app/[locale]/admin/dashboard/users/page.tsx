import Box from '@/components/box/box';
import ContentCard from '@/components/layouts/admin/content-card';
import UsersTableWrapper from '@/components/layouts/admin/dashboard/users/users-table-wrapper';
import PageTitle from '@/components/layouts/admin/page-title';
import { getTranslations } from 'next-intl/server';

const UsersPage = async () => {
  const t = await getTranslations('adminPage.usersPage');

  return (
    <Box variant="container">
      <Box variant="column" className="w-full gp-12">
        <PageTitle title={t('title')} />
        <ContentCard>
          <UsersTableWrapper />
        </ContentCard>
      </Box>
    </Box>
  );
};

export default UsersPage;

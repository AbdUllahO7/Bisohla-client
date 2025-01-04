import Box from '@/components/box/box';
import SignOutLink from '@/components/auth/signout-link';
import Text from '@/components/text/text';

const Dashboard = async () => {
  return (
    <Box>
      <Text variant="h1">User Dashboard</Text>
      <SignOutLink />
      {/* Add user dashboard content */}
    </Box>
  );
};

export default Dashboard;

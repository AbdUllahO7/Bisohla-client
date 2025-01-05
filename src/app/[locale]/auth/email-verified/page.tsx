import Box from '@/components/box/box';
import Text from '@/components/text/text';

const EmailVerifiedPage = async ({
  searchParams,
}: {
  searchParams: {
    status: 'success' | 'error';
    message: string;
  };
}) => {
  const { status, message } = await searchParams;

  return (
    <Box>
      <Text variant="h5">Email Verification</Text>
      {status === 'success' && <Text className="text-success">{message}</Text>}
      {status === 'error' && <Text className="text-danger">{message}</Text>}
    </Box>
  );
};

export default EmailVerifiedPage;

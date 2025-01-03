import AuthButtons from '../../auth/auth-buttons';
import Box from '../../box/box';
import Logo from '../../logo';

const MainAppBar = () => {
  return (
    <Box variant="row" className="w-full">
      <Box variant="container">
        <Box variant="row" className="items-center justify-between">
          <Box>
            <Logo />
          </Box>
          <Box>
            <AuthButtons />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainAppBar;

import { FC } from 'react';
import Box from './box/box';

// app/loading.tsx
const WholeAppLoadingProgress: FC = () => {
  return (
    <Box className="flex items-center justify-center w-full h-screen">
      <Box className="animate-spin w-12 h-12 rounded-full border-4 border-t-primary-light"></Box>
    </Box>
  );
};

export default WholeAppLoadingProgress;

import Box from '@/components/box/box';
import Steps from '@/components/web/ProductsPage/addProducts/main/Steps';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { redirect } from 'next/navigation';
import React from 'react';

// Server component for authentication check
async function AddProductsPage() {
  // Check authentication status
  const authResult = await checkAuth();


  // The logic was inverted - if NOT successful, delete session and redirect
  if (!authResult.success) {
    redirect('/auth/sign-in');
  }

  return (
    <Box variant="column" className="mt-2 bg-background">
      <Box className="w-full " variant="column">
        <Steps />
      </Box>
    </Box>
  );
}

export default AddProductsPage;

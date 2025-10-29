'use client';

import { useState, useEffect } from 'react';
import AppDownloadModal from '@/components/web/design/AppDownloadModal';

/**
 * Show modal on EVERY visit (unless user opts out)
 * Modal appears after specified delay
 */
export default function AppDownloadModalProvider() {
  const [showAppModal, setShowAppModal] = useState(false);

  useEffect(() => {
    console.log('🎯 Checking if modal should show...');
    
    // Only check if user opted out
    const skipAppDownload = localStorage.getItem('skipAppDownload');
    
    if (!skipAppDownload) {
      console.log('✅ No skip flag, showing modal in 3 seconds...');
      
      // Show modal after delay
      const timer = setTimeout(() => {
        console.log('🚀 Showing modal!');
        setShowAppModal(true);
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timer);
    } else {
      console.log('⏭️ User opted out, not showing modal');
    }
  }, []);

  return (
    <AppDownloadModal
      open={showAppModal}
      onOpenChange={(open) => {
        setShowAppModal(open);
        
        // If user closes modal, don't show again
        if (!open) {
          localStorage.setItem('skipAppDownload', 'true');
        }
      }}
    />
  );
}

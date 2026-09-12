// utils/stepNavigationUtils.ts

// Simple toast notification function
export const showStepNavigationToast = (message: string, type: 'error' | 'warning' | 'info' = 'warning') => {
  // Create a simple toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm max-w-sm transition-all duration-300 transform translate-x-full opacity-0`;
  
  // Set background color based on type
  switch (type) {
    case 'error':
      toast.className += ' bg-red-500';
      break;
    case 'warning':
      toast.className += ' bg-yellow-500';
      break;
    case 'info':
      toast.className += ' bg-blue-500';
      break;
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

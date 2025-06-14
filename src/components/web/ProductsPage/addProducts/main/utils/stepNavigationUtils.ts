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

// Get step navigation messages based on locale
export const getStepNavigationMessages = (isArabic: boolean) => ({
  stepLocked: isArabic 
    ? 'يجب إكمال الخطوات السابقة أولاً' 
    : 'Please complete previous steps first',
  stepNotValid: isArabic 
    ? 'الخطوة الحالية غير مكتملة' 
    : 'Current step is not complete',
  navigationBlocked: isArabic 
    ? 'لا يمكن الانتقال إلى هذه الخطوة' 
    : 'Cannot navigate to this step',
});

// Enhanced step accessibility checker with detailed reasons
export const checkStepAccessibility = (
  targetStepIndex: number, 
  currentStepIndex: number, 
  stepValidation: Record<string, boolean>,
  steps: string[],
  isEditMode: boolean
): { accessible: boolean; reason?: string } => {
  
  // In edit mode, all steps are accessible
  if (isEditMode) {
    return { accessible: true };
  }
  
  // Current step is always accessible
  if (targetStepIndex === currentStepIndex) {
    return { accessible: true };
  }
  
  // Previous steps are always accessible
  if (targetStepIndex < currentStepIndex) {
    return { accessible: true };
  }
  
  // For future steps, check if all intermediate steps are valid
  for (let i = currentStepIndex; i < targetStepIndex; i++) {
    const stepKey = steps[i];
    if (!stepValidation[stepKey]) {
      return { 
        accessible: false, 
        reason: `Step ${i + 1} (${stepKey}) must be completed first` 
      };
    }
  }
  
  return { accessible: true };
};
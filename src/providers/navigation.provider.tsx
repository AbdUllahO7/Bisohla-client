import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (state: boolean) => void;
}

interface NavigationProviderProps {
  children: ReactNode;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = (): void => setIsNavigating(true);
    const handleComplete = (): void => setIsNavigating(false);

    window.addEventListener('navigationStart', handleStart);
    window.addEventListener('navigationComplete', handleComplete);

    return () => {
      window.removeEventListener('navigationStart', handleStart);
      window.removeEventListener('navigationComplete', handleComplete);
    };
  }, []);

  // Reset loading state when navigation completes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const contextValue: NavigationContextType = {
    isNavigating,
    setIsNavigating,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="h-1 bg-blue-500">
            <div
              className="h-full bg-blue-700 animate-loading"
              style={{ width: '25%' }}
            />
          </div>
        </div>
      )}
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook with type safety
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export default NavigationProvider;

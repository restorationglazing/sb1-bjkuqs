import { useState, useEffect } from 'react';
import { auth, verifyPremiumStatus } from '../utils/firebase';

const VERIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const verifyStatus = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await verifyPremiumStatus(auth.currentUser.uid);
        setIsPremium(result.isPremium);
        setLastVerified(result.lastVerified);
        setError(result.error || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify premium status');
      } finally {
        setIsLoading(false);
      }
    };

    verifyStatus();

    // Set up periodic verification
    if (auth.currentUser) {
      interval = setInterval(verifyStatus, VERIFICATION_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return { isPremium, isLoading, error, lastVerified };
}
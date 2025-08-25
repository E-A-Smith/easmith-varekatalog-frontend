/**
 * Simplified API status hook
 * Step 3.1: Streamlined approach for AWS Amplify compatibility
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api';

export function useApiStatus() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const healthy = await apiClient.healthCheck();
      setIsHealthy(healthy);
      setLastCheck(new Date());
      return healthy;
    } catch {
      setIsHealthy(false);
      setLastCheck(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Auto-check on mount and periodically
  useEffect(() => {
    checkHealth();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    isChecking,
    checkHealth
  };
}
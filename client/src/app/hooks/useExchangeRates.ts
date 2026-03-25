import { useState, useEffect } from 'react';
import { Rate, exchangeRateService } from '../services/exchangeRateService';

export function useExchangeRates() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    exchangeRateService.getRates()
      .then(data => {
        if (isMounted) {
          setRates(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Error fetching rates:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return { rates, loading, error };
}
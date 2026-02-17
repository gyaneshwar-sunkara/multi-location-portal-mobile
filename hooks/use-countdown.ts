import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  autoStart?: boolean;
}

interface UseCountdownReturn {
  timeLeft: number;
  isExpired: boolean;
  restart: (seconds: number) => void;
}

export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {},
): UseCountdownReturn {
  const { autoStart = true } = options;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart && initialSeconds > 0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const restart = useCallback((seconds: number) => {
    setTimeLeft(seconds);
    setRunning(seconds > 0);
  }, []);

  return { timeLeft, isExpired: timeLeft <= 0, restart };
}

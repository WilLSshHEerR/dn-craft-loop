import { useEffect, useState } from 'react';

export function useTypewriter(fullLength: number, speed = 55, delay = 400, resetKey = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (cancelled) return;
      const interval = setInterval(() => {
        setCount((c) => {
          if (c >= fullLength) { clearInterval(interval); return c; }
          return c + 1;
        });
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [fullLength, speed, delay, resetKey]);

  return { count, done: count >= fullLength };
}

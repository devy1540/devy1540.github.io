import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function TopLoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setProgress(10);

    const timer1 = setTimeout(() => setProgress(50), 100);
    const timer2 = setTimeout(() => setProgress(80), 200);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div 
        className="h-0.5 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: `hsl(var(--primary))`,
          boxShadow: `0 0 10px hsl(var(--primary))`,
        }}
      />
    </div>
  );
}
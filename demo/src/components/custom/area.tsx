import { useEffect, useRef, memo } from 'react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';

export const Area = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        manager.mount(ref.current).startPlaying();
      }
    });
  }, []);
  return <div ref={ref} className="w-full h-full" />;
});

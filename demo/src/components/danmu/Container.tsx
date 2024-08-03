import { useEffect, useRef, memo } from 'react';
import { Maximize } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';

export const Container = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const format = () => {
        manager.nextFrame(() => manager.format());
      };
      if (ref.current) {
        manager.mount(ref.current).startPlaying();
        document.addEventListener('fullscreenchange', format);
      }
      return () => {
        if (ref.current) {
          ref.current.removeEventListener('fullscreenchange', format);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        id="RenderContainer"
        style={{ height: 'calc(100% - 40px)' }}
        className="w-full relative top-[40px]"
      >
        <Maximize
          color="#000"
          strokeWidth={3}
          className="absolute z-10 bottom-2 right-2 cursor-pointer"
          onClick={() => {
            if (!ref.current) return;
            ref.current.requestFullscreen();
            manager.asyncEach((b) => b.destroy());
          }}
        />
      </div>
    );
  },
);

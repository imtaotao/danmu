import { useEffect, useRef, memo } from 'react';
import { Maximize } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';

export const Container = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const format = () => {
        manager.nextFrame(() => {
          if (ref.current) {
            manager.mount(ref.current);
          }
        });
      };

      if (ref.current) {
        manager.mount(ref.current);
        manager.startPlaying();
        document.addEventListener('fullscreenchange', format);
      }

      return () => {
        document.removeEventListener('fullscreenchange', format);
      };
    }, []);

    return (
      <div
        ref={ref}
        id="RenderContainer"
        className="w-full relative top-[40px]"
        style={{ height: 'calc(100% - 40px)' }}
      >
        <Maximize
          color="#000"
          strokeWidth={3}
          className="absolute z-[100] bottom-2 right-2 cursor-pointer"
          onClick={() => {
            if (!document.fullscreenElement) {
              if (ref.current) {
                manager.each((d) => d.destroy());
                ref.current.requestFullscreen();
              }
            } else {
              document.exitFullscreen();
            }
          }}
        />
      </div>
    );
  },
);

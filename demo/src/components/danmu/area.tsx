import { useEffect, useRef, memo } from 'react';
import { once } from 'aidly';
import { Maximize } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';

export const Area = memo(({ manager }: { manager: Manager<DanmakuValue> }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plugin = manager.use({
      render: once(() => {
        manager.box.setStyle('backgroundColor', '#f1f5f9');
      }),
    });
    return () => {
      manager.remove(plugin.name);
    };
  }, []);

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
    <div ref={ref} id="AreaContainer" className="w-full h-full relative">
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
});

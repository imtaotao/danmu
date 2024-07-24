import { useEffect, useRef, memo } from 'react';
import { Maximize } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import githubLogo from '@/assets/github.svg';

export const Area = memo(({ manager }: { manager: Manager<DanmakuValue> }) => {
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
    <div ref={ref} id="AreaContainer" className="w-full h-full relative">
      <a
        className="block w-[30px]"
        target="_blank"
        href="https://github.com/imtaotao/danmu"
      >
        <img
          src={githubLogo}
          alt="github logo"
          className="w-[30px] h-[30px] absolute z-10 right-2"
        />
      </a>
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

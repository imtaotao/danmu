import { useState, useEffect } from 'react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import githubLogo from '@/assets/github.svg';
import { Area } from '@/components/custom/area';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/custom/sidebar';
import { Transmitter } from '@/components/custom/transmitter';

export function App({ manager }: { manager: Manager<BarrageValue> }) {
  const [allNumber, setAllNumber] = useState(0);
  const [stashNumber, setStashNumber] = useState(0);
  const [renderNumber, setRenderNumber] = useState(0);

  useEffect(() => {
    const name = 'BarrageNumber';
    const update = () => {
      const { all, view, stash, flexible } = manager.len();
      setAllNumber(all);
      setStashNumber(stash);
      setRenderNumber(view + flexible);
    };
    manager.use({
      name,
      $destroy: () => update(),
      $moveStart: () => update(),
      push: () => update(),
      clear: () => update(),
    });
    return () => {
      manager.remove(name);
    };
  }, []);

  return (
    <div className="w-full bg-slate-200">
      <div className="mx-auto aspect-[4/2] p-3 h-screen flex text-slate-600">
        <div className="min-w-96 w-96 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
          <a target="_blank" href="https://github.com/imtaotao/danmuku">
            <img
              src={githubLogo}
              alt="github logo"
              className="w-[30px] h-[30px] mb-4"
            />
          </a>
          <Sidebar
            manager={manager}
            allNumber={allNumber}
            stashNumber={stashNumber}
            renderNumber={renderNumber}
          />
        </div>
        <div className="w-full flex flex-col">
          <div className="h-5/6 p-3 border-slate-400 border-indigo-500/50 rounded bg-slate-100">
            <Area manager={manager} />
          </div>
          <div className="flex-1 p-3 mt-2 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
            <Transmitter manager={manager} />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

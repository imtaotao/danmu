import { useState, useEffect } from 'react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Area } from '@/components/custom/area';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/custom/sidebar';
import { Transmitter } from '@/components/custom/transmitter';

export function App({ manager }: { manager: Manager<BarrageValue> }) {
  const [allNumber, setAllNumber] = useState(0);
  const [renderNumber, setRenderNumber] = useState(0);

  useEffect(() => {
    const name = 'BarrageNumber';
    manager.use({
      name,
      push() {
        setAllNumber(manager.len().all);
      },
      render() {
        const { all, view } = manager.len();
        setAllNumber(all);
        setRenderNumber(view);
      },
      clear() {
        const { all, view } = manager.len();
        setAllNumber(all);
        setRenderNumber(view);
      },
      $destroy() {
        const { all, view } = manager.len();
        setAllNumber(all);
        setRenderNumber(view);
      },
    });
    return () => {
      manager.remove(name);
    };
  }, []);

  return (
    <div className="w-full bg-slate-200">
      <div className="container aspect-[4/3] p-3 mx-auto h-screen flex text-slate-600">
        <div className="min-w-80 w-96 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
          <Sidebar
            manager={manager}
            allNumber={allNumber}
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

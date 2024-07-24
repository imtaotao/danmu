import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Area } from '@/components/danmu/area';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/sidebar/index';
import { Transmitter } from '@/components/danmu/transmitter';

export function App({ manager }: { manager: Manager<DanmakuValue> }) {
  return (
    <div className="w-full bg-slate-200">
      <div className="p-3 h-screen flex text-slate-600">
        <div className="min-w-96 w-96 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
          <Sidebar manager={manager} />
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

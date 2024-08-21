import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { cn, isMobile } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { TopBar } from '@/components/danmu/TopBar';
import { Container } from '@/components/danmu/Container';
import { Transmitter } from '@/components/danmu/Transmitter';

export function App({ manager }: { manager: Manager<DanmakuValue> }) {
  return (
    <div className="w-full bg-slate-200">
      <div
        className={cn(
          isMobile ? '' : 'p-3',
          'w-[100vw] h-screen flex text-slate-600',
        )}
      >
        {isMobile ? null : (
          <div className="min-w-96 w-96 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
            <Sidebar manager={manager} />
          </div>
        )}
        <div className="w-full flex flex-col">
          <div
            className={cn(
              isMobile ? 'h-full' : 'h-5/6 p-3',
              'border-slate-400 border-indigo-500/50 rounded bg-slate-100',
            )}
          >
            <TopBar />
            <Container manager={manager} />
          </div>
          {isMobile ? null : (
            <div className="flex-1 p-3 mt-2 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
              <Transmitter manager={manager} />
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

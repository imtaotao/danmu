import { useState } from 'react';
import { Manager, type Barrage } from 'danmu';
import type { BarrageValue } from '@/types';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const BarrageBox = (props: {
  manager: Manager<BarrageValue>;
  barrage: Barrage<BarrageValue>;
}) => {
  const b = props.barrage;
  const { content, isSelf } = b.data.value;
  const opacity = (props.manager.statuses['_opacity'] as string) || '1';
  const [open, setOpen] = useState(false);

  b.use({
    pause: () => setOpen(true),
    resume: () => setOpen(false),
  });

  return (
    <div style={{ opacity }}>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => b.pause()}
            onMouseLeave={() => b.resume()}
            onClick={() => {
              setOpen(false);
              setTimeout(() => b.destroy(), 100);
            }}
            className={cn(
              isSelf ? 'border-2 border-slate-500' : '',
              'py-[1px] px-3 rounded-xl font-bold text-slate-900 text-center cursor-pointer bg-gray-300 hover:bg-gray-400',
            )}
          >
            {b.type === 'flexible' ? `高级弹幕 -- ${content}` : content}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-50 text-gray-400">
          这个是一个{b.type === 'flexible' ? '高级' : '普通'}弹幕 (ID:{' '}
          {b.data.id})
        </PopoverContent>
      </Popover>
    </div>
  );
};

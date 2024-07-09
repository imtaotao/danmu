import { useState } from 'react';
import type { Barrage } from 'danmu';
import type { BarrageValue } from '@/types';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const BarrageBox = (props: { barrage: Barrage<BarrageValue> }) => {
  const b = props.barrage;
  const { content, isSelf } = b.data.value;
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => b.pause()}
        onMouseLeave={() => b.resume()}
        className={cn(
          'h-[35px] py-1 px-3 rounded-xl font-bold text-slate-900 text-center cursor-pointer hover:bg-gray-300',
          isSelf ? 'border-2 border-slate-500' : '',
        )}
      >
        {content}
      </div>
      <Popover open={open}>
        <PopoverTrigger asChild></PopoverTrigger>
        <PopoverContent className="w-80"></PopoverContent>
      </Popover>
    </>
  );
};

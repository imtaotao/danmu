import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import type { Barrage, Manager } from 'danmu';
import type { Statuses, BarrageValue } from '@/types';
import { cn } from '@/lib/utils';
import avatarPath from '@/assets/avatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// 弹幕的渲染文件：demo/src/manager.tsx
export const BarrageBox = ({
  manager,
  barrage,
}: {
  barrage: Barrage<BarrageValue>;
  manager: Manager<BarrageValue, Statuses>;
}) => {
  const { content, isSelf } = barrage.data.value;
  const [open, setOpen] = useState(false);

  barrage.use({
    pause: () => setOpen(true),
    resume: () => setOpen(false),
    moveStart(barrage) {
      for (const key in manager.statuses) {
        type K = keyof typeof manager.statuses;
        barrage.setStyle(key as K, manager.statuses[key as K]);
      }
    },
  });

  return (
    <div>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => barrage.pause()}
            onMouseLeave={() => {
              if (!manager.isFreeze()) {
                barrage.resume();
              }
            }}
            onClick={() => {
              setOpen(false);
              setTimeout(() => barrage.destroy(), 100);
            }}
            className={cn(
              isSelf ? 'border-2 border-solid border-teal-500' : '',
              'py-[5px] px-3 rounded-xl font-bold text-slate-900 text-center cursor-pointer bg-gray-300 hover:bg-gray-400 flex items-center',
            )}
          >
            <Avatar className="w-[20px] h-[20px] mr-1">
              <AvatarImage src={avatarPath} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="mr-1">
              {barrage.type === 'flexible' ? `高级弹幕 -- ${content}` : content}
            </span>
            <ThumbsUp />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2 text-xs text-gray-500 text-center">
          这个是一个
          <span className="font-bold text-green-600">
            {barrage.type === 'flexible' ? '高级' : '普通'}弹幕
            {barrage.isFixed ? ' (被修正过运动时间)' : ''}
          </span>
        </PopoverContent>
      </Popover>
    </div>
  );
};

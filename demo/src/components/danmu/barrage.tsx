import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import type { Barrage, Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { cn } from '@/lib/utils';
import avatarPath from '@/assets/avatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const BarrageBox = ({
  manager,
  barrage,
}: {
  barrage: Barrage<BarrageValue>;
  manager: Manager<BarrageValue>;
}) => {
  const { content, isSelf } = barrage.data.value;
  const [open, setOpen] = useState(false);

  barrage.use({
    pause: () => setOpen(true),
    resume: () => setOpen(false),
    moveStart(barrage) {
      for (const key in barrage.statuses) {
        // 弹幕库内部默认的状态以 `$` 开头
        if (key.startsWith('$')) continue;
        barrage.setStyle(key as any, barrage.statuses[key] as string);
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
              isSelf ? 'border-2 border-teal-500' : '',
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
        <PopoverContent className="w-44 p-2 text-xs text-gray-500 text-center">
          这个是一个
          <span className="font-bold text-green-600">
            {barrage.type === 'flexible' ? '高级' : '普通'}弹幕
          </span>
        </PopoverContent>
      </Popover>
    </div>
  );
};

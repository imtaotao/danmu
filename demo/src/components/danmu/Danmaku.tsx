import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Danmaku, Manager } from 'danmu';
import type { Statuses, DanmakuValue } from '@/types';
import { cn } from '@/lib/utils';
import avatarPath from '@/assets/avatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Render file：demo/src/manager.tsx
export const DanmakuComponent = ({
  manager,
  danmaku,
}: {
  danmaku: Danmaku<DanmakuValue>;
  manager: Manager<DanmakuValue, Statuses>;
}) => {
  const { content, isSelf } = danmaku.data;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  danmaku.use({
    pause() {
      setOpen(true);
    },
    resume() {
      setOpen(false);
    },
    moveStart(b) {
      for (const key in manager.statuses) {
        b.setStyle(
          key as keyof Statuses,
          manager.statuses[key as keyof Statuses],
        );
      }
    },
  });

  return (
    <div>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => danmaku.pause()}
            onMouseLeave={() => {
              if (!manager.isFreeze()) {
                danmaku.resume();
              }
            }}
            onClick={() => {
              setOpen(false);
              setTimeout(() => danmaku.destroy(), 100);
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
              {danmaku.type === 'flexible'
                ? `${t('flexibleDanmaku')} -- ${content}`
                : content}
            </span>
            <ThumbsUp />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2 text-xs text-gray-500 text-center">
          {t('thisIsA')}
          <span className="font-bold text-green-600">
            {danmaku.type === 'flexible'
              ? t('flexibleDanmaku')
              : t('facileDanmaku')}
            {danmaku.isFixedDuration ? ` (${t('correctedDuration')})` : ''}
          </span>
        </PopoverContent>
      </Popover>
    </div>
  );
};

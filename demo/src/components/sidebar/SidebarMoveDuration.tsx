import { memo } from 'react';
import { throttle } from 'aidly';
import { useTranslation } from 'react-i18next';
import { Rabbit, CircleAlert } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarMoveDuration = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Rabbit />
            <span className="ml-3 mr-1">{t('setDuration')} (ms)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>{t('setDurationTip')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Input
          className="h-4/5 mr-2"
          type="number"
          placeholder="min"
          defaultValue={manager.options.durationRange[0]}
          onChange={throttle(1000, (e) => {
            manager.updateOptions({
              durationRange: [
                Number(e.target.value),
                manager.options.durationRange[1],
              ],
            });
          })}
        />
        <Input
          className="h-4/5"
          type="number"
          placeholder="max"
          defaultValue={manager.options.durationRange[1]}
          onChange={throttle(1000, (e) => {
            manager.setDurationRange([
              manager.options.durationRange[0],
              Number(e.target.value),
            ]);
          })}
        />
      </div>
    );
  },
);

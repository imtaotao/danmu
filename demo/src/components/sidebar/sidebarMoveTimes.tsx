import { memo } from 'react';
import { throttle } from 'aidly';
import { Rabbit } from 'lucide-react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarMoveTimes = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Rabbit />
                  <span className="ml-3">运动时长 (ms)</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                普通弹幕会从这两个值之间随机取一个值作为弹幕运动的时间
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          className="h-4/5 mr-2"
          type="number"
          placeholder="min"
          defaultValue={manager.options.times[0]}
          onChange={throttle(1000, (e) => {
            manager.updateOptions({
              times: [Number(e.target.value), manager.options.times[1]],
            });
          })}
        />
        <Input
          className="h-4/5"
          type="number"
          placeholder="max"
          defaultValue={manager.options.times[1]}
          onChange={throttle(1000, (e) => {
            manager.updateOptions({
              times: [manager.options.times[0], Number(e.target.value)],
            });
          })}
        />
      </div>
    );
  },
);

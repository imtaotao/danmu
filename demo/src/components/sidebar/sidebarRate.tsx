import { memo } from 'react';
import { throttle } from 'aidly';
import { Squirrel, CircleAlert } from 'lucide-react';
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

export const SidebarRate = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Squirrel />
            <span className="ml-3 mr-1">设置速率</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  速率默认为 1，弹幕的运动速度等于原始速度 * 速率
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="弹幕间距"
          defaultValue={manager.options.rate}
          onChange={throttle(500, (e) => {
            manager.setRate(Number(e.target.value), {
              updateExistingDanmu: true,
            });
          })}
        />
      </div>
    );
  },
);

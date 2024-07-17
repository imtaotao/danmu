import { memo } from 'react';
import { throttle } from 'aidly';
import { Squirrel, CircleAlert } from 'lucide-react';
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

export const SidebarGap = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Squirrel />
            <span className="ml-3 mr-1">弹幕之间的间距</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  同一条轨道在碰撞检测的啥情况下，后一条弹幕与前一条弹幕最小相隔的距离
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="弹幕间距"
          defaultValue={manager.options.gap}
          onChange={throttle(1000, (e) => {
            manager.updateOptions({ gap: Number(e.target.value) });
          })}
        />
      </div>
    );
  },
);

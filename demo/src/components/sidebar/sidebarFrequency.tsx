import { memo } from 'react';
import { throttle } from 'aidly';
import { Fish, CircleAlert } from 'lucide-react';
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

export const SidebarFrequency = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Fish />
            <span className="ml-3 mr-1  ">渲染频率 (ms)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  manager 会有一个定时器来轮询 push 普通弹幕，请设置合适的值
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="渲染频率"
          defaultValue={manager.options.interval}
          onChange={throttle(1000, (e) => {
            manager.updateOptions({ interval: Number(e.target.value) });
          })}
        />
      </div>
    );
  },
);

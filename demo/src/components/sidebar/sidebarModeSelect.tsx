import { memo } from 'react';
import { Snail, CircleAlert } from 'lucide-react';
import type { Mode, Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarModeSelect = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Snail />
            <span className="ml-3 mr-1">渲染模式</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  渲染模式决定着碰撞检测的规则和弹幕渲染的时机
                  <br />
                  1. 当设置为 none 模式时，不会有任何碰撞检测，弹幕会立即渲染
                  <br />
                  2. 当设置为 strict
                  模式时，会进行严格的碰撞检测，如果不满足条件则会推迟渲染
                  <br />
                  3. 当设置为 adaptive
                  模式时，在满足立即渲染的前提下，会尽力进行碰撞检测（推荐）
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Tabs
          defaultValue="strict"
          onFocus={(e) =>
            manager.updateOptions({
              mode: e.target.textContent?.trim() as Mode,
            })
          }
        >
          <TabsList>
            <TabsTrigger className="px-2 font-bold" value="none">
              none
            </TabsTrigger>
            <TabsTrigger className="px-2 font-bold" value="strict">
              strict
            </TabsTrigger>
            <TabsTrigger className="px-2 font-bold" value="adaptive">
              adaptive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  },
);

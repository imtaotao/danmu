import { memo } from 'react';
import { Shell } from 'lucide-react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SidebarFreeze = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="freeze"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <Shell />
          <span className="ml-3">恢复/冻结</span>
        </Label>
        <Switch
          id="freeze"
          onCheckedChange={(v) => {
            // 不要触发内置的 pause 和 resume 事件
            const options = { preventEvents: ['pause', 'resume'] };
            v ? manager.freeze(options) : manager.unfreeze(options);
          }}
        />
      </div>
    );
  },
);

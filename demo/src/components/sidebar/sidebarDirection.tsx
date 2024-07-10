import { memo } from 'react';
import { Bone } from 'lucide-react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SidebarDirection = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="render-direction"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <Bone />
          <span className="ml-3">方向（左/右）</span>
        </Label>
        <Switch
          id="render-direction"
          defaultChecked
          onCheckedChange={(v) =>
            manager.updateOptions({
              direction: v ? 'right' : 'left',
            })
          }
        />
      </div>
    );
  },
);

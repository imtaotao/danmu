import { memo } from 'react';
import { throttle } from 'aidly';
import { PawPrint } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const SidebarOpacity = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
          <PawPrint />
          <span className="ml-3">透明度</span>
        </Label>
        <Slider
          step={1}
          max={100}
          defaultValue={[100]}
          className="w-[100%] h-full"
          onValueChange={throttle(500, (v) => {
            const opacity = String(v[0] / 100);
            manager.statuses['opacity'] = opacity;
            manager.asyncEach((b) => {
              b.setStyle('opacity', opacity);
            });
          })}
        />
      </div>
    );
  },
);

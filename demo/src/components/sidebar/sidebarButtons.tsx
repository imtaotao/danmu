import { memo } from 'react';
import { randomColor } from 'aidly';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Button } from '@/components/ui/button';

export const SidebarButtons = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 items-center justify-end">
        <Button className="mr-3" onClick={() => manager.clear()}>
          清空弹幕
        </Button>
        <Button
          onClick={() => {
            const color = `#${randomColor('hex')}`;
            manager.statuses['background'] = color;
            manager.asyncEach((b) => b.setStyle('background', color));
          }}
        >
          随机颜色
        </Button>
      </div>
    );
  },
);

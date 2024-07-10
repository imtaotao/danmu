import { memo, useState, useEffect } from 'react';
import { Asterisk } from 'lucide-react';
import type { Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export const SidebarNumbers = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    const [allNumber, setAllNumber] = useState(0);
    const [stashNumber, setStashNumber] = useState(0);
    const [renderNumber, setRenderNumber] = useState(0);

    useEffect(() => {
      const name = 'BarrageNumber';
      const update = () => {
        const { all, view, stash, flexible } = manager.len();
        setAllNumber(all);
        setStashNumber(stash);
        setRenderNumber(view + flexible);
      };
      manager.use({
        name,
        $destroy: () => update(),
        $moveStart: () => update(),
        push: () => update(),
        clear: () => update(),
      });
      return () => {
        manager.remove(name);
      };
    }, [manager]);

    return (
      <>
        <div className="flex h-8 mb-4 items-center justify-between">
          <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
            <Asterisk />
            <span className="ml-3">实时渲染弹幕</span>
          </Label>
          <Badge>{renderNumber}</Badge>
        </div>
        <div className="flex h-8 mb-4 items-center justify-between">
          <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
            <Asterisk />
            <span className="ml-3">暂存区弹幕</span>
          </Label>
          <Badge>{stashNumber}</Badge>
        </div>
        <div className="flex h-8 mb-5 items-center justify-between">
          <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
            <Asterisk />
            <span className="ml-3">弹幕总量（包含暂存区）</span>
          </Label>
          <Badge>{allNumber}</Badge>
        </div>
      </>
    );
  },
);

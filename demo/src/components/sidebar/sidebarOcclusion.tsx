import { memo } from 'react';
import { VenetianMask } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import maskPath from '@/assets/mask.svg';

export const SidebarOcclusion = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="occlusion"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <VenetianMask />
          <span className="ml-3">取消/防遮挡</span>
        </Label>
        <Switch
          id="occlusion"
          onCheckedChange={(v) => manager.updateOccludedUrl(v ? maskPath : '')}
        />
      </div>
    );
  },
);

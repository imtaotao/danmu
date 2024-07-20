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
          onCheckedChange={(v) => {
            // 第二个参数是可选，如果不传递，默认是内置的弹幕容器
            // 但是需要注意的是：弹幕容器会随着设置显示区域而变化，此时可能需要第二个参数
            manager.updateOccludedUrl(
              v ? maskPath : '',
              document.getElementById('AreaContainer'),
            );
          }}
        />
      </div>
    );
  },
);

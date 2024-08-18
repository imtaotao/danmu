import { memo } from 'react';
import { VenetianMask } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import maskPath from '@/assets/mask.svg';

export const SidebarOcclusion = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="occlusion"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <VenetianMask />
          <span className="ml-3">{t('preventOcclusion')}</span>
        </Label>
        <Switch
          id="occlusion"
          onCheckedChange={(v) => {
            // The second parameter is optional, If not passed, the default is the built-in bullet container.
            // But it should be noted that the bullet container will change with the display area, so the second parameter may be required.
            manager.updateOccludedUrl(v ? maskPath : '', '#RenderContainer');
          }}
        />
      </div>
    );
  },
);

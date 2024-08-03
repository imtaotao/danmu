import { memo } from 'react';
import { Shell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SidebarFreeze = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="freeze"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <Shell />
          <span className="ml-3">{t('setFreeze')}</span>
        </Label>
        <Switch
          id="freeze"
          onCheckedChange={(v) => {
            // Do not trigger the built-in `pause` and `resume` events
            const options = { preventEvents: ['pause', 'resume'] };
            v ? manager.freeze(options) : manager.unfreeze(options);
          }}
        />
      </div>
    );
  },
);

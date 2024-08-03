import { memo, useState, useEffect } from 'react';
import { Bird } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SidebarStartAndStop = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();
    const [checked, setChecked] = useState(manager.isPlaying());

    useEffect(() => {
      manager.use({
        stop: () => setChecked(false),
        start: () => setChecked(true),
      });
    }, [manager]);

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="start-stop"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <Bird />
          <span className="ml-3">{t('setStart')}</span>
        </Label>
        <Switch
          id="start-stop"
          checked={checked}
          onCheckedChange={(v) =>
            v ? manager.startPlaying() : manager.stopPlaying()
          }
        />
      </div>
    );
  },
);

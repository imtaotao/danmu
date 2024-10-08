import { memo } from 'react';
import { Dog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const SidebarAreaX = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
          <Dog />
          <span className="ml-3">{t('setArea')} (X)</span>
        </Label>
        <Slider
          step={1}
          min={1}
          max={100}
          defaultValue={[1, 100]}
          className="w-[100%] h-full"
          onValueChange={(v) => {
            manager.setArea({
              x: {
                end: `${v[1]}%`,
                start: `${v[0]}%`,
              },
            });
          }}
        />
      </div>
    );
  },
);

import { memo } from 'react';
import { Turtle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SidebarShowAndHide = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="show-hide"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <Turtle />
          <span className="ml-3">{t('setShow')}</span>
        </Label>
        <Switch
          id="show-hide"
          defaultChecked
          onCheckedChange={(v) => {
            v ? manager.show() : manager.hide();
          }}
        />
      </div>
    );
  },
);

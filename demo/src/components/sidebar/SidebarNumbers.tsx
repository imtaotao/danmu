import { memo, useState, useEffect } from 'react';
import { sleep } from 'aidly';
import { Asterisk } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export const SidebarNumbers = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();
    const [allNumber, setAllNumber] = useState(0);
    const [stashNumber, setStashNumber] = useState(0);
    const [renderNumber, setRenderNumber] = useState(0);

    useEffect(() => {
      const name = 'DanmakuNumber';
      const update = () => {
        const { all, view, stash } = manager.len();
        setAllNumber(all);
        setStashNumber(stash);
        setRenderNumber(view);
      };
      manager.use({
        name,
        push: () => update(),
        clear: () => update(),
        $destroyed: () => update(),
        $beforeMove: () => update(),
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
            <span className="ml-3">{t('setNumbersTitle')}</span>
          </Label>
          <Badge>{renderNumber}</Badge>
        </div>
        <div className="flex h-8 mb-4 items-center justify-between">
          <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
            <Asterisk />
            <span className="ml-3">{t('stashNumber')}</span>
          </Label>
          <Badge>{stashNumber}</Badge>
        </div>
        <div className="flex h-8 mb-5 items-center justify-between">
          <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
            <Asterisk />
            <span className="ml-3">{t('allNumber')}</span>
          </Label>
          <Badge>{allNumber}</Badge>
        </div>
      </>
    );
  },
);

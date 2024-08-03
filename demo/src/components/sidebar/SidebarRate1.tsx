import { memo } from 'react';
import { throttle } from 'aidly';
import { useTranslation } from 'react-i18next';
import { Squirrel, CircleAlert } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarRate = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Squirrel />
            <span className="ml-3 mr-1">{t('setRate')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>{t('setRateTip')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder={t('setRate')}
          defaultValue={manager.options.rate}
          onChange={throttle(500, (e) => {
            manager.setRate(Number(e.target.value));
          })}
        />
      </div>
    );
  },
);

import { memo } from 'react';

import { useTranslation } from 'react-i18next';
import { Layers, CircleAlert } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarOverlap = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Layers size={20} />
            <span className="ml-3 mr-1">{t('setOverlap')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>{t('setOverlapTip')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Slider
          className="flex-1"
          max={1}
          min={0}
          step={0.1}
          defaultValue={[0]}
          onValueChange={([val]) => {
            manager.setOverlap(val);
          }}
        />
      </div>
    );
  },
);

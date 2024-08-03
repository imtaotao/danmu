import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Snail, CircleAlert } from 'lucide-react';
import type { Mode, Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarModeSelect = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <Snail />
            <span className="ml-3 mr-1">{t('setMode')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  {t('setModeTipTitle')}
                  <br />
                  1. {t('setModeTipOne')}
                  <br />
                  2. {t('setModeTipTwo')}
                  <br />
                  3. {t('setModeTipThree')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Tabs
          defaultValue="strict"
          onFocus={(e) =>
            manager.updateOptions({
              mode: e.target.textContent?.trim() as Mode,
            })
          }
        >
          <TabsList>
            <TabsTrigger className="px-2 font-bold" value="none">
              none
            </TabsTrigger>
            <TabsTrigger className="px-2 font-bold" value="strict">
              strict
            </TabsTrigger>
            <TabsTrigger className="px-2 font-bold" value="adaptive">
              adaptive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  },
);

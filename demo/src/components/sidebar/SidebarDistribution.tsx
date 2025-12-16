import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { List, CircleAlert } from 'lucide-react';
import type { Manager, ManagerOptions } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SidebarDistribution = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const { t } = useTranslation();

    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          <div className="flex items-center">
            <List />
            <span className="ml-3 mr-1">{t('setDistribution')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleAlert size={16} className="cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  {t('setDistributionTipTitle')}
                  <br />
                  1. {t('setDistributionTipOne')}
                  <br />
                  2. {t('setDistributionTipTwo')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Label>
        <Tabs
          defaultValue="random"
          onFocus={(e) =>
            manager.updateOptions({
              distribution:
                e.target.textContent?.trim() as ManagerOptions['distribution'],
            })
          }
        >
          <TabsList>
            <TabsTrigger className="px-2 font-bold" value="random">
              random
            </TabsTrigger>
            <TabsTrigger className="px-2 font-bold" value="order">
              order
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  },
);

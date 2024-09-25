import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { SidebarGap } from '@/components/sidebar/SidebarGap';
import { SidebarRate } from '@/components/sidebar/SidebarRate';
import { SidebarAreaX } from '@/components/sidebar/SidebarAreaX';
import { SidebarAreaY } from '@/components/sidebar/SidebarAreaY';
import { SidebarFreeze } from '@/components/sidebar/SidebarFreeze';
import { SidebarOpacity } from '@/components/sidebar/SidebarOpacity';
import { SidebarNumbers } from '@/components/sidebar/SidebarNumbers';
import { SidebarDirection } from '@/components/sidebar/SidebarDirection';
import { SidebarFrequency } from '@/components/sidebar/SidebarFrequency';
import { SidebarOcclusion } from '@/components/sidebar/SidebarOcclusion';
import { SidebarModeSelect } from '@/components/sidebar/SidebarModeSelect';
import { SidebarShowAndHide } from '@/components/sidebar/SidebarShowAndHide';
import { SidebarMoveDuration } from '@/components/sidebar/SidebarMoveDuration';
import { SidebarStartAndStop } from '@/components/sidebar/SidebarStartAndStop';

export const Sidebar = ({ manager }: { manager: Manager<DanmakuValue> }) => {
  return (
    <>
      <SidebarOpacity manager={manager} />
      <SidebarAreaX manager={manager} />
      <SidebarAreaY manager={manager} />
      <SidebarGap manager={manager} />
      <SidebarFrequency manager={manager} />
      <SidebarMoveDuration manager={manager} />
      <SidebarRate manager={manager} />
      <SidebarModeSelect manager={manager} />
      <SidebarFreeze manager={manager} />
      <SidebarOcclusion manager={manager} />
      <SidebarDirection manager={manager} />
      <SidebarShowAndHide manager={manager} />
      <SidebarStartAndStop manager={manager} />
      <SidebarNumbers manager={manager} />
    </>
  );
};

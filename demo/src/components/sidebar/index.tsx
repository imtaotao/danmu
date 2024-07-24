import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { SidebarGap } from '@/components/sidebar/sidebarGap';
import { SidebarRate } from '@/components/sidebar/sidebarRate';
import { SidebarAreaX } from '@/components/sidebar/sidebarAreaX';
import { SidebarAreaY } from '@/components/sidebar/sidebarAreaY';
import { SidebarFreeze } from '@/components/sidebar/sidebarFreeze';
import { SidebarOpacity } from '@/components/sidebar/sidebarOpacity';
import { SidebarNumbers } from '@/components/sidebar/sidebarNumbers';
import { SidebarDirection } from '@/components/sidebar/sidebarDirection';
import { SidebarFrequency } from '@/components/sidebar/sidebarFrequency';
import { SidebarMoveTimes } from '@/components/sidebar/sidebarMoveTimes';
import { SidebarOcclusion } from '@/components/sidebar/sidebarOcclusion';
import { SidebarModeSelect } from '@/components/sidebar/sidebarModeSelect';
import { SidebarShowAndHide } from '@/components/sidebar/sidebarShowAndHide';
import { SidebarStartAndStop } from '@/components/sidebar/sidebarStartAndStop';

export const Sidebar = ({ manager }: { manager: Manager<DanmakuValue> }) => {
  return (
    <>
      <SidebarOpacity manager={manager} />
      <SidebarAreaX manager={manager} />
      <SidebarAreaY manager={manager} />
      <SidebarGap manager={manager} />
      <SidebarFrequency manager={manager} />
      <SidebarMoveTimes manager={manager} />
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

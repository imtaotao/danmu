import { memo } from 'react';
import { VenetianMask } from 'lucide-react';
import type { Manager } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import maskPath from '@/assets/mask.svg';

export const SidebarOcclusion = memo(
  ({ manager }: { manager: Manager<DanmakuValue> }) => {
    const l = `data:image/svg+xml,<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='668px' style='transform:scale(1,1.001);' height='375.75px' viewBox='0 0 320.000000 180.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,180.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M0 905 l0 -895 513 1 c281 1 504 3 495 6 -15 4 -14 8 7 40 28 40 30 51 45 228 13 149 31 216 71 263 16 18 29 36 29 40 0 4 27 29 59 56 34 28 62 60 66 75 4 14 18 35 32 47 l27 21 -42 83 c-23 46 -42 95 -42 110 0 30 30 78 97 157 54 64 98 80 186 66 53 -9 59 -8 73 11 8 11 14 26 14 32 0 17 63 54 91 54 31 -1 100 -49 116 -80 18 -35 17 -90 -1 -90 -8 0 -17 -9 -21 -19 -3 -10 -14 -21 -25 -24 -30 -8 -35 -34 -16 -86 18 -52 23 -216 6 -226 -6 -4 -18 -24 -27 -46 -8 -22 -24 -44 -34 -50 -23 -12 -24 -32 -4 -49 8 -7 15 -21 15 -31 0 -10 6 -33 14 -51 53 -123 66 -160 79 -218 8 -36 18 -94 22 -130 7 -68 31 -130 64 -167 l19 -23 636 0 636 0 0 895 0 895 -1600 0 -1600 0 0 -895z'/><path d='M1375 517 c-44 -18 -100 -46 -125 -64 -42 -29 -47 -36 -67 -109 -11 -44 -29 -111 -40 -150 -18 -62 -18 -76 -7 -120 7 -27 13 -52 14 -56 0 -5 142 -8 315 -8 l315 0 0 48 c0 26 -11 78 -26 117 -14 39 -35 97 -45 130 -15 47 -33 76 -86 133 -74 79 -117 112 -148 112 -11 0 -56 -15 -100 -33z'/></g></svg>`;
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="occlusion"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
        >
          <VenetianMask />
          <span className="ml-3">防遮挡/取消遮挡</span>
        </Label>
        <Switch
          id="occlusion"
          onCheckedChange={(v) => manager.updateOccludedUrl(v ? l : '')}
        />
      </div>
    );
  },
);

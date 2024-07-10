import { memo } from 'react';
import { throttle } from 'aidly';
import type { Manager, Mode } from 'danmu';
import type { BarrageValue } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Opacity = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        透明度
      </Label>
      <Slider
        step={1}
        max={100}
        defaultValue={[100]}
        className="w-[100%] h-full"
        onValueChange={throttle(500, (v) => {
          const opacity = String(v[0] / 100);
          manager.statuses['_opacity'] = opacity;
          manager.asyncEach((b) => {
            b.setStyle('opacity', opacity);
          });
        })}
      />
    </div>
  );
});

const DisplayArea = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        显示区域
      </Label>
      <Slider
        step={1}
        max={100}
        defaultValue={[100]}
        className="w-[100%] h-full"
        onValueChange={throttle(2000, (v) => {
          manager.setArea({ height: `${v[0]}%` });
        })}
      />
    </div>
  );
});

const Gap = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        弹幕之间的间距
      </Label>
      <Input
        className="h-4/5"
        type="number"
        placeholder="弹幕间距"
        defaultValue={manager.options.gap}
        onChange={throttle(2000, (e) => {
          manager.updateOptions({ gap: Number(e.target.value) });
        })}
      />
    </div>
  );
});

export const Frequency = memo(
  ({ manager }: { manager: Manager<BarrageValue> }) => {
    return (
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          渲染频率 (ms)
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="渲染频率"
          defaultValue={manager.options.interval}
          onChange={throttle(2000, (e) => {
            manager.updateOptions({ interval: Number(e.target.value) });
          })}
        />
      </div>
    );
  },
);

const MoveTimes = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        运动时长 (ms)
      </Label>
      <Input
        className="h-4/5 mr-2"
        type="number"
        placeholder="min"
        defaultValue={manager.options.times[0]}
        onChange={throttle(2000, (e) => {
          manager.updateOptions({
            times: [Number(e.target.value), manager.options.times[1]],
          });
        })}
      />
      <Input
        className="h-4/5"
        type="number"
        placeholder="max"
        defaultValue={manager.options.times[1]}
        onChange={throttle(2000, (e) => {
          manager.updateOptions({
            times: [manager.options.times[0], Number(e.target.value)],
          });
        })}
      />
    </div>
  );
});

export const Sidebar = ({
  manager,
  allNumber,
  renderNumber,
}: {
  manager: Manager<BarrageValue>;
  allNumber: number;
  renderNumber: number;
}) => {
  return (
    <div>
      <Opacity manager={manager} />
      <DisplayArea manager={manager} />
      <Gap manager={manager} />
      <Frequency manager={manager} />
      <MoveTimes manager={manager} />
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="show-hide"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          显示/隐藏
        </Label>
        <Switch
          id="show-hide"
          defaultChecked
          onCheckedChange={(v) => {
            v ? manager.show() : manager.hide();
          }}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="start-stop"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          启动/停止
        </Label>
        <Switch
          id="start-stop"
          defaultChecked
          onCheckedChange={(v) =>
            v ? manager.startPlaying() : manager.stopPlaying()
          }
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="render-direction"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          方向（左/右）
        </Label>
        <Switch
          id="render-direction"
          defaultChecked
          onCheckedChange={(v) =>
            manager.updateOptions({
              direction: v ? 'right' : 'left',
            })
          }
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          实时渲染数量
        </Label>
        <Badge>{renderNumber}</Badge>
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          现有弹幕总量（包含暂存区）
        </Label>
        <Badge>{allNumber}</Badge>
      </div>
      <div className="flex h-8 mb-8 items-center justify-between">
        <Label
          htmlFor="render-direction"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          渲染模式
        </Label>
        <Tabs
          defaultValue="strict"
          onFocus={(e) =>
            manager.updateOptions({ mode: e.target.textContent as Mode })
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
      <div className="flex h-8 items-center justify-end">
        <Button onClick={() => manager.clear()}>清空弹幕</Button>
      </div>
    </div>
  );
};

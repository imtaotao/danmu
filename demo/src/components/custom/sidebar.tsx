import { memo, useEffect, useState } from 'react';
import { randomColor, throttle } from 'aidly';
import type { Manager, Mode } from 'danmu';
import type { BarrageValue } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bird,
  Dog,
  Fish,
  Rabbit,
  Bone,
  Snail,
  Shell,
  PawPrint,
  Turtle,
  Squirrel,
  Asterisk,
} from 'lucide-react';

const Opacity = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
        <PawPrint />
        <span className="ml-3">透明度</span>
      </Label>
      <Slider
        step={1}
        max={100}
        defaultValue={[100]}
        className="w-[100%] h-full"
        onValueChange={throttle(500, (v) => {
          const opacity = String(v[0] / 100);
          manager.statuses['opacity'] = opacity;
          manager.asyncEach((b) => {
            b.setStyle('opacity', opacity);
          });
        })}
      />
    </div>
  );
});

const SetArea = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
        <Dog />
        <span className="ml-3">显示区域 (Y)</span>
      </Label>
      <Slider
        step={1}
        min={1}
        max={100}
        defaultValue={[1, 100]}
        className="w-[100%] h-full"
        onValueChange={(v) => {
          manager.setArea({
            y: {
              end: `${v[1]}%`,
              start: `${v[0]}%`,
            },
          });
        }}
      />
    </div>
  );
});

const Gap = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Squirrel />
                <span className="ml-3">弹幕之间的间距</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              同一条轨道在碰撞检测的啥情况下，后一条弹幕与前一条弹幕最小相隔的距离
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input
        className="h-4/5"
        type="number"
        placeholder="弹幕间距"
        defaultValue={manager.options.gap}
        onChange={throttle(1000, (e) => {
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Fish />
                  <span className="ml-3">渲染频率 (ms)</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                manager 会有一个定时器来轮询 push 普通弹幕，请设置合适的值
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="渲染频率"
          defaultValue={manager.options.interval}
          onChange={throttle(1000, (e) => {
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Rabbit />
                <span className="ml-3">运动时长 (ms)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              普通弹幕会从这两个值之间随机取一个值作为弹幕运动的时间
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input
        className="h-4/5 mr-2"
        type="number"
        placeholder="min"
        defaultValue={manager.options.times[0]}
        onChange={throttle(1000, (e) => {
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
        onChange={throttle(1000, (e) => {
          manager.updateOptions({
            times: [manager.options.times[0], Number(e.target.value)],
          });
        })}
      />
    </div>
  );
});

const Show = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label
        htmlFor="show-hide"
        className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
      >
        <Turtle />
        <span className="ml-3">隐藏/显示</span>
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
});

const StartAndStop = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  const [checked, setChecked] = useState(manager.isPlaying());

  useEffect(() => {
    manager.use({
      stop: () => setChecked(false),
      start: () => setChecked(true),
    });
  }, [manager]);

  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label
        htmlFor="start-stop"
        className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
      >
        <Bird />
        <span className="ml-3">停止/启动</span>
      </Label>
      <Switch
        id="start-stop"
        checked={checked}
        onCheckedChange={(v) =>
          v ? manager.startPlaying() : manager.stopPlaying()
        }
      />
    </div>
  );
});

const Direction = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label
        htmlFor="render-direction"
        className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
      >
        <Bone />
        <span className="ml-3">方向（左/右）</span>
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
  );
});

const Freeze = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label
        htmlFor="freeze"
        className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center"
      >
        <Shell />
        <span className="ml-3">恢复/冻结</span>
      </Label>
      <Switch
        id="freeze"
        onCheckedChange={(v) => {
          // 不要触发内置的 pause 和 resume 事件
          const options = { preventEvents: ['pause', 'resume'] };
          v ? manager.freeze(options) : manager.unfreeze(options);
        }}
      />
    </div>
  );
});

const ModeSelect = memo(({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div className="flex h-8 mb-4 items-center justify-between">
      <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Snail />
                <span className="ml-3">渲染模式</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              渲染模式决定着碰撞检测的规则和弹幕渲染的时机
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Tabs
        defaultValue="strict"
        onFocus={(e) =>
          manager.updateOptions({ mode: e.target.textContent as Mode })
        }
      >
        <TabsList>
          <TabsTrigger className="px-2 font-bold" value="none">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>none</div>
                </TooltipTrigger>
                <TooltipContent>
                  当设置为 none 模式时，不会有任何碰撞检测，弹幕会立即渲染
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsTrigger>
          <TabsTrigger className="px-2 font-bold" value="strict">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>strict</div>
                </TooltipTrigger>
                <TooltipContent>
                  当设置为 strict
                  模式时，会进行严格的碰撞检测，如果不满足条件则会推迟渲染
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsTrigger>
          <TabsTrigger className="px-2 font-bold" value="adaptive">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>adaptive</div>
                </TooltipTrigger>
                <TooltipContent>
                  当设置为 adaptive
                  模式时，在满足立即渲染的前提下，会尽力进行碰撞检测（推荐）
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
});

export const Sidebar = ({
  manager,
  allNumber,
  stashNumber,
  renderNumber,
}: {
  allNumber: number;
  stashNumber: number;
  renderNumber: number;
  manager: Manager<BarrageValue>;
}) => {
  return (
    <div>
      <Opacity manager={manager} />
      <SetArea manager={manager} />
      <Gap manager={manager} />
      <Frequency manager={manager} />
      <MoveTimes manager={manager} />
      <ModeSelect manager={manager} />
      <Direction manager={manager} />
      <Show manager={manager} />
      <StartAndStop manager={manager} />
      <Freeze manager={manager} />
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
          <Asterisk />
          <span className="ml-3">实时渲染弹幕</span>
        </Label>
        <Badge>{renderNumber}</Badge>
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
          <Asterisk />
          <span className="ml-3">暂存区弹幕</span>
        </Label>
        <Badge>{stashNumber}</Badge>
      </div>
      <div className="flex h-8 mb-8 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8 flex items-center">
          <Asterisk />
          <span className="ml-3">弹幕总量（包含暂存区）</span>
        </Label>
        <Badge>{allNumber}</Badge>
      </div>
      <div className="flex h-8 items-center justify-end">
        <Button className="mr-3" onClick={() => manager.clear()}>
          清空弹幕
        </Button>
        <Button
          onClick={() => {
            const color = `#${randomColor('hex')}`;
            manager.statuses['background'] = color;
            manager.asyncEach((b) => b.setStyle('background', color));
          }}
        >
          随机颜色
        </Button>
      </div>
    </div>
  );
};

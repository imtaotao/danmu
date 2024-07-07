import { type Manager } from 'danmu';
import type { BarrageValue } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Sidebar = ({ manager }: { manager: Manager<BarrageValue> }) => {
  return (
    <div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          透明度
        </Label>
        <Slider
          step={1}
          max={100}
          defaultValue={[100]}
          className={cn('w-[100%]', 'h-full')}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          显示区域
        </Label>
        <Slider
          step={1}
          max={100}
          defaultValue={[100]}
          className={cn('w-[100%]', 'h-full')}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          弹幕之间的间距
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="弹幕间距"
          defaultValue={manager.options.gap}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          渲染频率 (ms)
        </Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="渲染频率"
          defaultValue={manager.options.interval}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          运动时长 (ms)
        </Label>
        <Input
          className="h-4/5 mr-2"
          type="number"
          placeholder="min"
          defaultValue={manager.options.times[0]}
        />
        <Input
          className="h-4/5"
          type="number"
          placeholder="max"
          defaultValue={manager.options.times[1]}
        />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="show-hide"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          显示/隐藏
        </Label>
        <Switch id="show-hide" defaultChecked />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="start-stop"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          启动/停止
        </Label>
        <Switch id="start-stop" defaultChecked />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label
          htmlFor="render-direction"
          className="shrink-0 mr-3 h-full text-base font-bold leading-8"
        >
          方向（左/右）
        </Label>
        <Switch id="render-direction" defaultChecked />
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          实时渲染数量
        </Label>
        <Badge>0</Badge>
      </div>
      <div className="flex h-8 mb-4 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full text-base font-bold leading-8">
          现有弹幕总量（包含暂存区）
        </Label>
        <Badge>0</Badge>
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
          onFocus={(e) => console.log(e.target.textContent)}
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
        <Button>清空弹幕</Button>
      </div>
    </div>
  );
};

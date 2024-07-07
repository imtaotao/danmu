import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

export const Sidebar = () => {
  return (
    <div>
      <div className="flex h-8 mb-2 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full leading-8">透明度</Label>
        <Slider
          step={1}
          max={100}
          defaultValue={[50]}
          className={cn('w-[100%]', 'h-full')}
        />
      </div>
      <div className="flex h-8 mb-2 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full leading-8">渲染频率（ms）</Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="渲染频率"
          defaultValue={500}
        />
      </div>
      <div className="flex h-8 mb-2 items-center justify-between">
        <Label className="shrink-0 mr-3 h-full leading-8">显示区域（%）</Label>
        <Input
          className="h-4/5"
          type="number"
          placeholder="显示区域"
          max={100}
          min={0}
          defaultValue={100}
        />
      </div>
      <div className="flex h-8 mb-2 items-center justify-between">
        <Label htmlFor="show-hide" className="shrink-0 mr-3 h-full leading-8">
          显示/隐藏
        </Label>
        <Switch id="show-hide" />
      </div>
    </div>
  );
};

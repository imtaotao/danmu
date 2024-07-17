import { useState } from 'react';
import { random, uuid } from 'aidly';
import { Send, Pickaxe, CircleAlert } from 'lucide-react';
import type { Manager, Direction } from 'danmu';
import type { DanmakuValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetTitle,
  SheetFooter,
  SheetHeader,
  SheetContent,
  SheetDescription,
} from '@/components/ui/sheet';

export const Transmitter = ({
  manager,
}: {
  manager: Manager<DanmakuValue>;
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [direction, setDirection] = useState(manager.options.direction);
  const [duration, setDuration] = useState(random(...manager.options.times));

  const tip = (msg?: string) => {
    toast({
      duration: 800,
      variant: 'destructive',
      description: msg || '弹幕值不能为空',
    });
  };

  return (
    <div>
      <Textarea
        value={content}
        className="mb-4"
        placeholder="输入你的弹幕内容。"
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            if (!content) return tip();
            setOpen(true);
          }}
        >
          <Pickaxe />
        </Button>
        <Button
          className="ml-4"
          onClick={() => {
            if (!content) return tip();
            manager.unshift({
              id: uuid(),
              value: {
                content,
                isSelf: true,
              },
            });
            setContent('');
          }}
        >
          <Send />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen} aria-describedb>
        <SheetDescription />
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <span className="mr-2">设置高级弹幕的位置信息</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlert size={18} className="cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    由于弹幕库默认只支持 position 的单位为 px, 虽然这里是 %
                    的含义，是因为在组件内部通过计算会转换成了 px。
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SheetTitle>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-x" className="text-right font-bold">
                  位置 (x%)
                </Label>
                <Input
                  id="postion-x"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={x}
                  className="col-span-3 w-3/4"
                  onChange={(e) => setX(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-y" className="text-right font-bold">
                  位置 (y%)
                </Label>
                <Input
                  id="postion-y"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={y}
                  className="col-span-3 w-3/4"
                  onChange={(e) => setY(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-y" className="text-right font-bold">
                  时间 (ms)
                </Label>
                <Input
                  id="postion-y"
                  type="number"
                  defaultValue={duration}
                  className="col-span-3 w-3/4"
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="d-direction" className="text-right font-bold">
                  移动方向
                </Label>
                <Select
                  defaultValue={direction as string}
                  onValueChange={(e) => setDirection(e)}
                >
                  <SelectTrigger className="w-[185px]">
                    <SelectValue placeholder="选择方向" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">none</SelectItem>
                      <SelectItem value="left">left</SelectItem>
                      <SelectItem value="right">right</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter>
              <Button
                onClick={() => {
                  if (manager.isFreeze()) {
                    return tip('当前处于冻结状态');
                  }
                  setOpen(false);
                  setContent('');
                  setDuration(random(...manager.options.times));
                  manager.pushFlexibleDanmaku(
                    {
                      id: uuid(),
                      value: {
                        content,
                        isSelf: true,
                      },
                    },
                    {
                      duration,
                      direction: direction as Direction,
                      position: (box, b) => {
                        return {
                          x: ((box.width - b.getWidth()) * x) / 100,
                          y: ((box.height - b.getHeight()) * y) / 100,
                        };
                      },
                    },
                  );
                }}
              >
                <Send />
              </Button>
            </SheetFooter>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

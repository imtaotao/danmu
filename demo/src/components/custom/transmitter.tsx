import { useState } from 'react';
import { random, uuid } from 'aidly';
import type { Manager, Direction } from 'danmu';
import type { BarrageValue } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
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
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export const Transmitter = ({
  manager,
}: {
  manager: Manager<BarrageValue>;
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [direction, setDirection] = useState(manager.options.direction);
  const [duration, setDuration] = useState(random(...manager.options.times));

  const tip = () => {
    toast({
      duration: 800,
      title: '发送失败',
      description: '弹幕值不能为空',
    });
  };

  return (
    <div>
      <Textarea
        value={content}
        className="mb-4"
        placeholder="发送你的弹幕。"
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            if (!content) return tip();
            setOpen(true);
          }}
        >
          发送高级弹幕
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
          发送普通弹幕
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>设置高级弹幕的位置信息</SheetTitle>
            <SheetDescription>
              这里 demo 单位默认为 "%"，通过计算会转换为 px。
            </SheetDescription>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-x" className="text-right font-bold">
                  位置 (X)
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
                  位置 (Y)
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
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button
                className="mb-[5px]"
                onClick={() => {
                  setOpen(false);
                  setContent('');
                  setDuration(random(...manager.options.times));
                  manager.pushFlexBarrage(
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
                发送
              </Button>
            </SheetFooter>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

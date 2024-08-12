import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uuid, random, randomColor } from 'aidly';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [duration, setDuration] = useState(random(...manager.options.times));
  const [direction, setDirection] = useState<Direction>(
    manager.options.direction,
  );

  useEffect(() => {
    manager.use({
      updateOptions(newOptions) {
        if ('direction' in newOptions) {
          setDirection(newOptions.direction!);
        }
      },
    });
  }, []);

  const tip = (msg?: string) => {
    toast({
      duration: 800,
      variant: 'destructive',
      description: msg || t('notEmpityValue'),
    });
  };

  return (
    <div>
      <Textarea
        value={content}
        className="mb-4"
        placeholder={t('inputDanmaku')}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-end">
        <Button onClick={() => manager.clear()}>{t('clearDanmaku')}</Button>
        <Button
          className="ml-4"
          onClick={() => {
            const color = `#${randomColor('hex')}`;
            manager.statuses['background'] = color;
            manager.asyncEach((b) => b.setStyle('background', color));
          }}
        >
          {t('randomColor')}
        </Button>
        <Button
          className="ml-4"
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
            manager.unshift(
              {
                content,
                isSelf: true,
              },
              { id: uuid() },
            );
            setContent('');
          }}
        >
          <Send />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen} aria-describedb>
        <SheetDescription />
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <span className="mr-2">{t('setFlexiblePosition')}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlert size={18} className="cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>{t('setFlexibleDescription')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SheetTitle>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-x" className="text-right font-bold">
                  {t('position')} X (%)
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
                  {t('position')} Y (%)
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
                  {t('time')} (ms)
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
                  {t('direction')}
                </Label>
                <Select
                  defaultValue={direction as string}
                  onValueChange={(e) => setDirection(e as 'left' | 'right')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDirection')} />
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
                    return tip(t('currentlyFrozen'));
                  }
                  setOpen(false);
                  setContent('');
                  setDuration(random(...manager.options.times));
                  manager.pushFlexibleDanmaku(
                    {
                      content,
                      isSelf: true,
                    },
                    {
                      id: uuid(),
                      duration,
                      direction,
                      position: (d, _box) => {
                        return {
                          x: `${x}% - ${d.getWidth() / 2}`,
                          y: `${y}% - ${d.getHeight() / 2}`,
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

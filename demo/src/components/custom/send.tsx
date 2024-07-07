import { useState } from 'react';
import { type Manager } from 'danmu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Send = (props: { manager: Manager<unknown> }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Textarea className="mb-4" placeholder="发送你的弹幕。" />
      <div className="flex items-center justify-end">
        <Button onClick={() => setVisible(true)}>发送高级弹幕</Button>
        <Button className="ml-4">发送普通弹幕</Button>
      </div>
      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置高级弹幕的位置信息</DialogTitle>
            <DialogDescription>
              高级弹幕可以自由的设置 "x" 和 "y"，单位可以是 "%"" 或者 "px"，这里
              demo 单位默认为 "%"。
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-x" className="text-right font-bold">
                  位置 (X)
                </Label>
                <Input
                  id="postion-x"
                  type="number"
                  max={100}
                  min={0}
                  defaultValue={10}
                  className="col-span-3 w-3/4"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postion-y" className="text-right font-bold">
                  位置 (Y)
                </Label>
                <Input
                  id="postion-y"
                  type="number"
                  max={100}
                  min={0}
                  defaultValue={10}
                  className="col-span-3 w-3/4"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="d-direction" className="text-right font-bold">
                  移动方向
                </Label>
                <Select defaultValue="right">
                  <SelectTrigger className="w-[255px]">
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
            <DialogFooter>
              <Button type="submit">发送</Button>
              <Button onClick={() => setVisible(false)} className="mb-[5px]">
                取消
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

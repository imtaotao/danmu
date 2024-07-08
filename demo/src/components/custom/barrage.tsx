import type { Barrage } from 'danmu';
import type { BarrageValue } from '@/types';

export const BarrageBox = (props: { barrage: Barrage<BarrageValue> }) => {
  const b = props.barrage;
  return (
    <div
      onClick={() => b.destroy()}
      onMouseEnter={() => b.pause()}
      onMouseLeave={() => b.resume()}
      className="h-[35px] py-1 px-3 rounded-xl bg-gray-600 text-slate-100 text-center cursor-pointer"
    >
      {b.data.value}
    </div>
  );
};

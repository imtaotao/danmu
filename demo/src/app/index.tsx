import { type Manager } from 'danmu';
import { Send } from '@/components/custom/send';
import { Sidebar } from '@/components/custom/sidebar';
import './index.css';

export function App(props: { manager: Manager<unknown> }) {
  return (
    <div className="w-full bg-slate-200">
      <div className="container aspect-[4/3] p-3 mx-auto h-screen flex text-slate-600">
        <div className="min-w-80 w-96 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
          <Sidebar manager={props.manager} />
        </div>
        <div className="w-full flex flex-col">
          <div className="h-5/6 p-3 border-slate-400 border-indigo-500/50 rounded bg-slate-100">
            1
          </div>
          <div className="flex-1 p-3 mt-2 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
            <Send manager={props.manager} />
          </div>
        </div>
      </div>
    </div>
  );
}

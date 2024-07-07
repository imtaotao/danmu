import { Sidebar } from '@/components/custom/sidebar';
import './index.css';

export function App() {
  return (
    <div className="container aspect-[4/3] p-3 mx-auto h-screen flex bg-slate-200 text-slate-600">
      <div className="w-64 mr-2 px-4 py-3 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
        <Sidebar />
      </div>
      <div className="w-full flex flex-col">
        <div className="h-5/6 p-3 border-slate-400 border-indigo-500/50 rounded">
          弹幕区域
        </div>
        <div className="flex-1 p-3 mt-2 border-slate-400 border-indigo-500/50 rounded-sm bg-slate-300">
          弹幕设置区域
        </div>
      </div>
    </div>
  );
}

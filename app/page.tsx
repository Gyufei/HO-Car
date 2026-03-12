import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full max-w-xl rounded-2xl bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm md:p-10">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900 md:mb-8 md:text-4xl">
        水电费计算器
      </h1>

      <p className="mb-10 text-base leading-relaxed text-slate-600 md:text-lg">
        选择您需要使用的计算器功能
      </p>

      <div className="mb-8 grid grid-cols-1 gap-5">
        <Link
          href="/ele"
          className="group block h-full rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 p-7 text-left text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8"
        >
          <div className="mb-3 text-4xl">⚡</div>
          <div className="mb-2 text-xl font-bold">电费计算器</div>
          <p className="text-sm leading-relaxed opacity-90 md:text-base">
            计算两户电费分配
            <br />
            自动记忆上次读数
          </p>
        </Link>

        <Link
          href="/water"
          className="group block h-full rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 p-7 text-left text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-8"
        >
          <div className="mb-3 text-4xl">💧</div>
          <div className="mb-2 text-xl font-bold">水费计算器</div>
          <p className="text-sm leading-relaxed opacity-90 md:text-base">
            计算两户水费分配
            <br />
            自动记忆上次读数
          </p>
        </Link>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 md:text-sm">
          自动保存上次读数，方便下次使用
        </p>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "waterLastReadings";

type Results = {
  billA: number;
  billB: number;
  usageA: number;
  usageB: number;
  totalUsage: number;
} | null;

type BillRecord = {
  id: string;
  year: number;
  month: number;
  amount: number;
  usage: number;
  createdAt: string;
};

function readLastReadings() {
  if (typeof window === "undefined") {
    return {};
  }

  const lastReadings = window.localStorage.getItem(STORAGE_KEY);
  if (!lastReadings) {
    return {};
  }

  try {
    return JSON.parse(lastReadings) as {
      userALastCurrent?: number;
      userBLastCurrent?: number;
    };
  } catch {
    return {};
  }
}

export default function WaterBillCalculatorPage() {
  const [userACurrent, setUserACurrent] = useState("");
  const [userAPrevious, setUserAPrevious] = useState(() => {
    const readings = readLastReadings();
    return readings.userALastCurrent != null
      ? String(readings.userALastCurrent)
      : "";
  });
  const [userBCurrent, setUserBCurrent] = useState("");
  const [userBPrevious, setUserBPrevious] = useState(() => {
    const readings = readLastReadings();
    return readings.userBLastCurrent != null
      ? String(readings.userBLastCurrent)
      : "";
  });
  const [totalBill, setTotalBill] = useState("");
  const [results, setResults] = useState<Results>(null);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [history, setHistory] = useState<BillRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const totalUsageFromResults = useMemo(
    () => (results ? results.totalUsage : 0),
    [results],
  );

  const saveReadings = useCallback(() => {
    if (typeof window === "undefined") return;

    const userACurrentNum = parseFloat(userACurrent) || 0;
    const userBCurrentNum = parseFloat(userBCurrent) || 0;

    const readings = {
      userALastCurrent: userACurrentNum,
      userBLastCurrent: userBCurrentNum,
      timestamp: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }, [userACurrent, userBCurrent]);

  const calculateBills = useCallback(() => {
    const userACurrentNum = parseFloat(userACurrent) || 0;
    const userAPreviousNum = parseFloat(userAPrevious) || 0;
    const userBCurrentNum = parseFloat(userBCurrent) || 0;
    const userBPreviousNum = parseFloat(userBPrevious) || 0;
    const totalBillNum = parseFloat(totalBill) || 0;

    if (userACurrentNum < userAPreviousNum) {
      alert("我家本次水表读数不能小于上次表底读数！");
      return;
    }
    if (userBCurrentNum < userBPreviousNum) {
      alert("对家本次水表读数不能小于上次表底读数！");
      return;
    }
    if (totalBillNum <= 0) {
      alert("请输入正确的总水费金额！");
      return;
    }

    const usageA = userACurrentNum - userAPreviousNum;
    const usageB = userBCurrentNum - userBPreviousNum;
    const totalUsage = usageA + usageB;

    if (totalUsage === 0) {
      alert("总用水量不能为0！");
      return;
    }

    const billA = (usageA / totalUsage) * totalBillNum;
    const billB = (usageB / totalUsage) * totalBillNum;

    setResults({
      billA,
      billB,
      usageA,
      usageB,
      totalUsage,
    });

    saveReadings();
  }, [
    saveReadings,
    totalBill,
    userACurrent,
    userAPrevious,
    userBCurrent,
    userBPrevious,
  ]);

  const resetForm = useCallback(() => {
    setUserACurrent("");
    setUserAPrevious("");
    setUserBCurrent("");
    setUserBPrevious("");
    setTotalBill("");
    setResults(null);

    if (typeof window === "undefined") return;

    if (window.confirm("是否同时清除浏览器中保存的上次读数记录？")) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const readings = readLastReadings();
      if (readings.userALastCurrent != null) {
        setUserAPrevious(String(readings.userALastCurrent));
      }
      if (readings.userBLastCurrent != null) {
        setUserBPrevious(String(readings.userBLastCurrent));
      }
    }
  }, []);

  useEffect(() => {
    // 回车键触发计算
    if (typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        calculateBills();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calculateBills]);

  useEffect(() => {
    // 关闭窗口前保存当前本次读数
    if (typeof window === "undefined") return;
    const handler = () => {
      const userACurrentNum = parseFloat(userACurrent);
      const userBCurrentNum = parseFloat(userBCurrent);

      if (
        (userACurrentNum !== undefined && !Number.isNaN(userACurrentNum)) ||
        (userBCurrentNum !== undefined && !Number.isNaN(userBCurrentNum))
      ) {
        saveReadings();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveReadings, userACurrent, userBCurrent]);

  const hasResults = results !== null;

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const res = await fetch("/api/bills?type=WATER");
      if (!res.ok) {
        throw new Error("加载历史记录失败");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "加载历史记录失败");
      }
      const list: BillRecord[] = data.data.map((item: any) => ({
        id: item.id,
        year: item.year,
        month: item.month,
        amount: Number(item.amount),
        usage: Number(item.usage),
        createdAt: item.createdAt,
      }));
      setHistory(list);
    } catch (error) {
      console.error(error);
      setHistoryError("加载历史记录失败，请稍后重试。");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleSaveBill = useCallback(async () => {
    if (!hasResults) {
      alert("请先完成一次水费计算，再保存记录。");
      return;
    }

    const amountNum = parseFloat(totalBill) || 0;
    if (amountNum <= 0 || totalUsageFromResults <= 0) {
      alert("总水费或总用水量不合法，无法保存。");
      return;
    }

    setSaving(true);
    setSavingError(null);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "WATER",
          year,
          month,
          amount: amountNum,
          usage: totalUsageFromResults,
        }),
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "保存失败");
      }

      await loadHistory();
      alert("已保存本次水费记录。");
    } catch (error) {
      console.error(error);
      setSavingError("保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }, [
    hasResults,
    loadHistory,
    month,
    totalBill,
    totalUsageFromResults,
    year,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("确定要删除这条记录吗？")) return;
      try {
        const res = await fetch(`/api/bills/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("删除失败");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error?.message || "删除失败");
        }
        await loadHistory();
      } catch (error) {
        console.error(error);
        alert("删除失败，请稍后再试。");
      }
    },
    [loadHistory],
  );

  return (
    <main className="relative w-full max-w-5xl rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8 md:p-10">
      <Link
        href="/"
        className="absolute left-6 top-5 inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-emerald-600"
      >
        <span className="mr-1.5">🏠</span>
        返回主页
      </Link>

      <h1 className="mb-8 pt-6 text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        💧 水费计算器
      </h1>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* 表单区域 */}
        <section className="flex-1 space-y-6">
          <div className="space-y-4">
            {/* 用户 A */}
            <div className="rounded-2xl border-2 border-sky-500 bg-gradient-to-r from-sky-50 to-white p-5 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-sky-700">
                🏠 我家 (用户A)
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="w-32 shrink-0 text-sm font-medium text-slate-600 sm:text-base">
                    本次水表读数:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={userACurrent}
                    onChange={(e) => setUserACurrent(e.target.value)}
                    placeholder="请输入本次读数"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm outline-none ring-sky-400 transition focus:border-sky-400 focus:ring-2 sm:text-base"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="w-32 shrink-0 text-sm font-medium text-slate-600 sm:text-base">
                    上次水表底数:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={userAPrevious}
                    onChange={(e) => setUserAPrevious(e.target.value)}
                    placeholder="请输入上次读数"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm outline-none ring-sky-400 transition focus:border-sky-400 focus:ring-2 sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* 用户 B */}
            <div className="rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-50 to-white p-5 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-rose-700">
                🏘️ 对家 (用户B)
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="w-32 shrink-0 text-sm font-medium text-slate-600 sm:text-base">
                    本次水表读数:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={userBCurrent}
                    onChange={(e) => setUserBCurrent(e.target.value)}
                    placeholder="请输入本次读数"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm outline-none ring-rose-400 transition focus:border-rose-400 focus:ring-2 sm:text-base"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="w-32 shrink-0 text-sm font-medium text-slate-600 sm:text-base">
                    上次水表底数:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={userBPrevious}
                    onChange={(e) => setUserBPrevious(e.target.value)}
                    placeholder="请输入上次读数"
                    className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm outline-none ring-rose-400 transition focus:border-rose-400 focus:ring-2 sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* 总水费 */}
            <div className="flex flex-col gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
              <label className="w-40 shrink-0 text-sm font-semibold text-slate-700 sm:text-base">
                本次总水费 (元):
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={totalBill}
                onChange={(e) => setTotalBill(e.target.value)}
                placeholder="请输入总水费"
                className="w-full rounded-lg border-2 border-sky-200 px-3 py-2 text-sm outline-none ring-sky-400 transition focus:border-sky-400 focus:ring-2 sm:text-base"
              />
            </div>
          </div>

          <div className="mt-1 space-y-3">
            <button
              type="button"
              onClick={calculateBills}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-base font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              <span className="mr-2">📊</span>
              计算水费分配
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="flex w-full items-center justify-center rounded-lg bg-slate-400 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-500"
            >
              <span className="mr-2">🔄</span>
              重置数据
            </button>

            <div className="mt-2 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    账单年份
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value) || year)}
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none ring-emerald-400 transition focus:border-emerald-400 focus:ring-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    月份
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value) || month)}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none ring-emerald-400 transition focus:border-emerald-400 focus:ring-2"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveBill}
                disabled={saving}
                className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "保存中..." : "保存本次水费记录"}
              </button>

              {savingError && (
                <p className="text-xs text-rose-600" role="alert">
                  {savingError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 结果区域 & 历史记录 */}
        <section className="flex-1 space-y-4">
          <div
            className={`rounded-2xl p-6 sm:p-7 ${
              hasResults
                ? "bg-gradient-to-br from-teal-100 via-rose-100 to-amber-100"
                : "flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-center"
            }`}
          >
            {!hasResults ? (
              <div>
                <div className="mb-3 text-4xl opacity-70">💡</div>
                <p className="text-base text-slate-600 sm:text-lg">
                  点击“计算水费分配”查看结果
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-center text-lg font-semibold text-slate-800 sm:text-xl">
                  📋 计算结果
                </div>

                <div className="space-y-3 text-sm sm:text-base">
                  <div className="rounded-lg border-2 border-sky-500 bg-sky-50 px-4 py-3 font-semibold text-sky-700">
                    🏠 我家应缴水费:{" "}
                    <span>{results!.billA.toFixed(2)}</span> 元
                  </div>

                  <div className="rounded-lg border-2 border-rose-500 bg-rose-50 px-4 py-3 font-semibold text-rose-700">
                    🏘️ 对家应缴水费:{" "}
                    <span>{results!.billB.toFixed(2)}</span> 元
                  </div>

                  <div className="rounded-lg bg-white/70 px-4 py-2">
                    💧 我家用水量:{" "}
                    <span className="font-semibold">
                      {results!.usageA.toFixed(2)}
                    </span>{" "}
                    方
                  </div>

                  <div className="rounded-lg bg-white/70 px-4 py-2">
                    💧 对家用水量:{" "}
                    <span className="font-semibold">
                      {results!.usageB.toFixed(2)}
                    </span>{" "}
                    方
                  </div>

                  <div className="rounded-lg bg-white/80 px-4 py-2">
                    🔢 总用水量:{" "}
                    <span className="font-semibold">
                      {results!.totalUsage.toFixed(2)}
                    </span>{" "}
                    方
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-inner">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                📜 历史水费记录
              </h2>
              <button
                type="button"
                onClick={() => loadHistory()}
                disabled={loadingHistory}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingHistory ? "刷新中..." : "刷新"}
              </button>
            </div>

            {historyError && (
              <p className="mb-2 text-xs text-rose-600" role="alert">
                {historyError}
              </p>
            )}

            {history.length === 0 ? (
              <p className="text-xs text-slate-500">
                暂无历史记录，先保存一条试试吧。
              </p>
            ) : (
              <div className="max-h-72 space-y-1 overflow-y-auto text-xs text-slate-700 sm:text-sm">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium">
                        {item.year} 年 {item.month} 月
                      </div>
                      <div className="text-[11px] text-slate-500 sm:text-xs">
                        总水费 {item.amount.toFixed(2)} 元 · 总用水量{" "}
                        {item.usage.toFixed(2)} 方
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-medium text-rose-500 hover:text-rose-600"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


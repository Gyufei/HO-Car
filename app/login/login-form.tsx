"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/ele";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("登录失败，请检查用户名和密码。");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A]">
      {/* 背景：深沉黑色，但有轻微层次 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_650px_at_50%_18%,rgba(59,130,246,0.10),transparent_60%),radial-gradient(700px_520px_at_20%_80%,rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.10] mix-blend-overlay bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1px,transparent_0)] bg-size-[18px_18px]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[radial-gradient(800px_500px_at_70%_40%,rgba(255,255,255,0.10),transparent_65%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">
          <section className="flex items-center justify-center">
            <div className="w-full">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-12">
                <header className="mb-8 text-center">
                  <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold tracking-wide text-white/85">
                    HOME CALC
                  </div>
                  <div className="mt-3 text-xs text-white/55">登录后继续</div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-white/80"
                      htmlFor="username"
                    >
                      用户名
                    </label>
                    <div className="relative">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/55"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-full border border-white/10 bg-white/5 px-12 py-4 text-base text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-white/25 focus:bg-white/10 focus:shadow-[0_0_0_6px_rgba(59,130,246,0.16)]"
                        autoComplete="username"
                        placeholder="请输入用户名"
                        inputMode="text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-white/80"
                      htmlFor="password"
                    >
                      密码
                    </label>
                    <div className="relative">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/55"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7 11V7a5 5 0 0 1 10 0v4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-full border border-white/10 bg-white/5 px-12 py-4 text-base text-white outline-none ring-0 transition placeholder:text-white/35 focus:border-white/25 focus:bg-white/10 focus:shadow-[0_0_0_6px_rgba(59,130,246,0.16)]"
                        autoComplete="current-password"
                        placeholder="请输入密码"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                      role="alert"
                    >
                      <div className="flex items-start gap-2">
                        <span aria-hidden className="mt-0.5 select-none">
                          ⚠
                        </span>
                        <p className="leading-relaxed">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-full bg-white px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_26px_65px_rgba(0,0,0,0.7)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-0 transition group-enabled:opacity-100"
                    >
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_10%,rgba(59,130,246,0.45),transparent_60%),radial-gradient(circle_at_65%_95%,rgba(99,102,241,0.30),transparent_62%)]" />
                    </span>
                    <span className="relative">
                      {loading ? "正在登录..." : "登录"}
                    </span>
                  </button>
                </form>
              </div>

              <div className="mt-6 text-center text-xs text-white/45">
                Home Calc · 简洁界面，鲜明层级
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


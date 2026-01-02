"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Bookmark } from 'lucide-react';

export default function Home() {
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('exam-bookmarks');
    if (stored) {
      try {
        const bookmarks = JSON.parse(stored);
        setBookmarkCount(bookmarks.length);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8 sm:mb-12 pt-4 sm:pt-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-blue-600 p-3 sm:p-4 rounded-full">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">AI問題集メーカー</h1>
          <p className="text-slate-600 text-sm sm:text-lg">効率的に学習できる問題集を生成</p>
        </header>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <Link href="/generate">
            <button className="w-full bg-white hover:shadow-lg transition-all p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 group active:scale-95 sm:active:scale-100">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="text-left min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                    新規問題を生成
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs sm:text-base line-clamp-2">
                    試験名や資料からAIが自動で問題を生成します
                  </p>
                </div>
                <ArrowRight className="text-blue-600 group-hover:translate-x-2 transition flex-shrink-0" size={28} />
              </div>
            </button>
          </Link>

          <Link href="/bookmarks">
            <button className="w-full bg-white hover:shadow-lg transition-all p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-amber-200 hover:border-amber-400 group active:scale-95 sm:active:scale-100">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="text-left min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 group-hover:text-amber-600 transition line-clamp-1">
                    ブックマーク済み問題
                  </h2>
                  <p className="text-slate-600 mt-1 text-xs sm:text-base line-clamp-2">
                    {bookmarkCount > 0
                      ? `${bookmarkCount}問のブックマーク済み問題があります`
                      : 'ブックマークした問題はまだありません'}
                  </p>
                </div>
                <Bookmark className="text-amber-500 flex-shrink-0" size={28} fill="currentColor" />
              </div>
            </button>
          </Link>
        </div>

        <div className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">特徴</h3>
          <ul className="space-y-1 sm:space-y-2 text-slate-600 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
              <span>URLやテキストから自動で問題を生成</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
              <span>難易度を選択して最適な問題を生成</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
              <span>重要な問題をブックマークして復習</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
              <span>正解率を表示して学習進捗を確認</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

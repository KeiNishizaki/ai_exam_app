"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Send, Loader2 } from 'lucide-react';

const DIFFICULTIES = [
  { value: "初心者向け", label: "初心者向け" },
  { value: "試験相応", label: "試験相応" },
  { value: "専門家向け", label: "専門家向け" }
];

export default function GeneratePage() {
  const router = useRouter();
  const [examType, setExamType] = useState('');
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [directText, setDirectText] = useState('');
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState('試験相応');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!examType.trim()) {
      alert("試験名を入力してください。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          examType,
          referenceUrl: inputType === 'url' ? url : null,
          referenceText: inputType === 'text' ? directText : null,
          questionCount,
          difficulty
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const questions = Array.isArray(data) ? data : (data.questions || []);
      
      // セッションストレージに問題データを保存
      sessionStorage.setItem('exam-session', JSON.stringify({
        examType,
        questions,
        createdAt: new Date().toISOString()
      }));
      
      // 最初の問題ページにリダイレクト
      router.push('/exam/0');
    } catch (e) {
      alert("エラーが発生しました。");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーションバー */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
          <Link href="/">
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white hover:shadow-md transition text-slate-700 border border-slate-200 text-sm sm:text-base">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">戻る</span>
            </button>
          </Link>
          <Link href="/">
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white hover:shadow-md transition text-slate-700 border border-slate-200 text-sm sm:text-base">
              <Home size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">ホーム</span>
            </button>
          </Link>
        </div>

        {/* タイトル */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">問題を生成</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">学習内容を入力して、AIが自動で問題を生成します</p>
        </header>

        {/* 試験名入力 */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-3">
            試験名 <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            className="w-full p-2 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm sm:text-base"
            placeholder="例：プログラミング、データベース、ネットワーク..."
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-2">
            この試験に関する問題を生成します。URLやテキストが提供されている場合は参考にします。
          </p>
        </div>

        {/* 入力タイプ選択 */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-3">
            学習資料の入力方式
          </label>
          <div className="flex gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => setInputType('url')}
              className={`flex-1 p-2 sm:p-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                inputType === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              URLから取得
            </button>
            <button
              onClick={() => setInputType('text')}
              className={`flex-1 p-2 sm:p-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                inputType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              テキストを直接入力
            </button>
          </div>

          {inputType === 'url' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">
                学習したいサイトのURL
              </label>
              <input 
                type="url"
                className="w-full p-2 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm sm:text-base"
                placeholder="https://example.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {inputType === 'text' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">
                学習資料のテキスト
              </label>
              <textarea 
                className="w-full p-2 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 h-24 sm:h-32 text-sm sm:text-base"
                placeholder="スクレイピング禁止サイトからコピーしたテキストを貼り付けてください..."
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 問題数と難易度 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-3">
              出題数: <span className="text-blue-600 font-bold">{questionCount}問</span>
            </label>
            <input 
              type="range"
              min="1"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>1問</span>
              <span>10問</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-3">
              難易度
            </label>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  className={`p-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                    difficulty === diff.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成ボタン */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={handleGenerate}
            disabled={loading || !examType.trim()}
            className="w-full bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                生成中...
              </>
            ) : (
              <>
                <Send size={20} />
                問題を生成して開始
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

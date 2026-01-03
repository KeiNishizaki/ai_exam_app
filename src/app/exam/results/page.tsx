"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, RotateCcw, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface ExamSession {
  examType: string;
  questions: Question[];
  createdAt: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem('exam-session');
    if (stored) {
      setSession(JSON.parse(stored));
    }
    
    const storedAnswers = sessionStorage.getItem('exam-answers');
    if (storedAnswers) {
      try {
        const parsed = JSON.parse(storedAnswers);
        const normalized: Record<number, number> = {};
        Object.keys(parsed).forEach((k) => {
          const num = Number(k);
          if (!Number.isNaN(num)) normalized[num] = parsed[k];
        });
        setAnswers(normalized);
      } catch (e) {
        console.error('exam-answers parse error', e);
      }
    }

    // 結果ページにしたら紙吹雪
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.3 }
      });
    }, 300);
  }, []);

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <p className="text-slate-600 mb-4">セッション情報が見つかりません</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
              ホームに戻る
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const correctCount = session.questions.filter(
    (_, idx) => answers[idx] === session.questions[idx].answer
  ).length;
  const totalCount = session.questions.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  // 成績評価
  let gradeLabel = '';
  let gradeColor = '';
  if (percentage >= 80) {
    gradeLabel = '優秀';
    gradeColor = 'from-blue-600 to-blue-500';
  } else if (percentage >= 60) {
    gradeLabel = '合格';
    gradeColor = 'from-green-600 to-green-500';
  } else if (percentage >= 40) {
    gradeLabel = '要復習';
    gradeColor = 'from-amber-600 to-amber-500';
  } else {
    gradeLabel = '要徹底復習';
    gradeColor = 'from-red-600 to-red-500';
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <Link href="/">
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white hover:shadow-md transition text-slate-700 border border-slate-200 text-sm sm:text-base">
              <Home size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">ホーム</span>
            </button>
          </Link>
        </div>

        {/* スコア表示 */}
        <div className={`bg-gradient-to-r ${gradeColor} text-white p-6 sm:p-8 rounded-2xl shadow-lg mb-6 sm:mb-8 text-center`}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">完了！</h1>
          <p className="text-lg sm:text-xl opacity-90 mb-6">あなたの成績は以下の通りです</p>
          
          <div className="bg-white/20 backdrop-blur p-6 sm:p-8 rounded-xl mb-6">
            <div className="text-6xl sm:text-7xl font-bold mb-2">{percentage}%</div>
            <p className="text-lg sm:text-xl font-semibold">{correctCount} / {totalCount} 問正解</p>
          </div>

          <div className="inline-block bg-white/20 backdrop-blur px-4 sm:px-6 py-2 rounded-full">
            <p className="text-xl sm:text-2xl font-bold">{gradeLabel}</p>
          </div>
        </div>

        {/* 成績詳細 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{correctCount}</div>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">正解</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{totalCount - correctCount}</div>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">不正解</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalCount}</div>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">全問題数</p>
          </div>
        </div>

        {/* 問題ごとの結果 */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">問題ごとの結果</h2>
          <div className="space-y-2 sm:space-y-4">
            {session.questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.answer;
              const userAnswerLabel = typeof userAnswer === 'number' ? String.fromCharCode(65 + userAnswer) : '未回答';
              
              return (
                <div key={idx} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                  isCorrect
                    ? 'border-l-green-500 bg-green-50'
                    : 'border-l-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2">
                        問 {idx + 1}: {q.question}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        あなたの答え: <span className="font-medium">{userAnswerLabel}</span>
                        {!isCorrect && (
                          <>
                            {' → '}
                            <span className="font-medium text-green-600">
                              正解: {String.fromCharCode(65 + q.answer)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className={`font-bold text-lg sm:text-xl flex-shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '○' : '×'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* アクション */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link href="/bookmarks">
            <button className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-amber-700 transition text-sm sm:text-base">
              <Bookmark size={20} />
              ブックマークを確認
            </button>
          </Link>
          <Link href="/generate">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base">
              <RotateCcw size={20} />
              新しく問題を生成
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

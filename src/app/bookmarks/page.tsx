"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarkedQuestion {
  examId: string;
  questionIndex: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  userAnswer?: number;
  isCorrect?: boolean;
  timestamp: number;
}

// NOTE: 将来的にはAzure DBから取得するように変更予定
// const useBookmarksFromAPI = () => {
//   const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
//   const [isLoaded, setIsLoaded] = useState(false);
//
//   useEffect(() => {
//     const fetchBookmarks = async () => {
//       try {
//         const res = await fetch('/api/bookmarks', {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' }
//         });
//         const data = await res.json();
//         setBookmarks(data.bookmarks || []);
//       } catch (error) {
//         console.error('Failed to fetch bookmarks:', error);
//       }
//       setIsLoaded(true);
//     };
//     fetchBookmarks();
//   }, []);
//
//   const addBookmark = async (question: Omit<BookmarkedQuestion, 'timestamp'>) => {
//     try {
//       const res = await fetch('/api/bookmarks', {
//         method: 'POST',
//         body: JSON.stringify(question),
//         headers: { 'Content-Type': 'application/json' }
//       });
//       const data = await res.json();
//       setBookmarks(data.bookmarks || []);
//     } catch (error) {
//       console.error('Failed to add bookmark:', error);
//     }
//   };
//
//   const removeBookmark = async (examId: string, questionIndex: number) => {
//     try {
//       const res = await fetch('/api/bookmarks', {
//         method: 'DELETE',
//         body: JSON.stringify({ examId, questionIndex }),
//         headers: { 'Content-Type': 'application/json' }
//       });
//       const data = await res.json();
//       setBookmarks(data.bookmarks || []);
//     } catch (error) {
//       console.error('Failed to remove bookmark:', error);
//     }
//   };
//
//   return { bookmarks, addBookmark, removeBookmark, isLoaded };
// };

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, isLoaded } = useBookmarks();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  // グループ化
  const groupedByExam = bookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.examId]) {
      acc[bookmark.examId] = [];
    }
    acc[bookmark.examId].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkedQuestion[]>);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
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

        {/* ページタイトル */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-600 p-2 sm:p-3 rounded-full">
              <BookOpen className="text-white sm:w-7 sm:h-7" size={24} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">ブックマーク済み問題</h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base ml-11 sm:ml-15">合計 {bookmarks.length} 問のブックマーク済み問題があります</p>
        </header>

        {bookmarks.length === 0 ? (
          // 空の状態
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-12 text-center">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ブックマークがまだありません</h2>
            <p className="text-slate-600 mb-6 text-sm sm:text-base">問題ページでブックマークボタンをクリックすると、ここに表示されます</p>
            <Link href="/generate">
              <button className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base">
                問題を生成する
              </button>
            </Link>
          </div>
        ) : (
          // ブックマークリスト
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedByExam).map(([examId, questions]) => (
              <div key={examId} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                {/* グループヘッダー */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-slate-200">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">{examId}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">{questions.length} 問</p>
                </div>

                {/* 問題リスト */}
                <div className="divide-y divide-slate-100">
                  {questions.map((question, idx) => {
                    const expandId = `${examId}-${question.questionIndex}`;
                    const isExpanded = expandedId === expandId;

                    return (
                      <div key={idx} className="p-3 sm:p-6 hover:bg-slate-50 transition">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : expandId)}
                          className="w-full text-left flex items-start justify-between gap-3 sm:gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold bg-amber-100 text-amber-700 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                                問 {question.questionIndex + 1}
                              </span>
                              {question.isCorrect !== undefined && (
                                <span className={`text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${
                                  question.isCorrect
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {question.isCorrect ? '正解' : '不正解'}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed line-clamp-2">
                              {question.question}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="text-slate-400" size={20} />
                            ) : (
                              <ChevronDown className="text-slate-400" size={20} />
                            )}
                          </div>
                        </button>

                        {/* 詳細表示 */}
                        {isExpanded && (
                          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
                            {/* 選択肢 */}
                            <div className="mb-4 sm:mb-6">
                              <h4 className="font-semibold text-slate-800 mb-2 sm:mb-3 text-sm sm:text-base">選択肢</h4>
                              <div className="space-y-2">
                                {question.options.map((option, optIdx) => {
                                  const isAnswer = optIdx === question.answer;
                                  const isUserAnswer = optIdx === question.userAnswer;

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                                        isAnswer
                                          ? 'bg-green-50 border border-green-200 text-green-700'
                                          : isUserAnswer
                                          ? 'bg-red-50 border border-red-200 text-red-700'
                                          : 'bg-slate-50 border border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span className="font-bold">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>{' '}
                                      {option}
                                      {isAnswer && ' ← 正解'}
                                      {isUserAnswer && !isAnswer && ' ← あなたの答え'}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 解説 */}
                            <div className="mb-4 sm:mb-6">
                              <h4 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">解説</h4>
                              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                                {question.explanation}
                              </p>
                            </div>

                            {/* 削除ボタン */}
                            <button
                              onClick={() => removeBookmark(examId, question.questionIndex)}
                              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition border border-red-200 text-xs sm:text-sm"
                            >
                              <Trash2 size={16} />
                              ブックマークを削除
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

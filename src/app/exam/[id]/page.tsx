"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Bookmark, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
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

export default function ExamQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionIndex = parseInt(params.id as string, 10);
  
  const [session, setSession] = useState<ExamSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);
  const [isAnswered, setIsAnswered] = useState(false);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked, isLoaded } = useBookmarks();

  useEffect(() => {
    const stored = sessionStorage.getItem('exam-session');
    if (stored) {
      setSession(JSON.parse(stored));
    }
  }, []);

  if (!session || questionIndex >= session.questions.length) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">すべての問題に回答しました！</h1>
          <Link href="/exam/results">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
              結果を確認
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const question = session.questions[questionIndex];
  const isCurrentBookmarked = isLoaded && isBookmarked(session.examType, questionIndex);

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    // 回答をセッションストレージに記録
    const existingAnswers = sessionStorage.getItem('exam-answers');
    const answers = existingAnswers ? JSON.parse(existingAnswers) : {};
    answers[questionIndex] = optionIndex;
    sessionStorage.setItem('exam-answers', JSON.stringify(answers));
    
    // 正解時に紙吹雪を飛ばす
    if (optionIndex === question.answer) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleBookmark = () => {
    if (isCurrentBookmarked) {
      removeBookmark(session.examType, questionIndex);
    } else {
      addBookmark({
        examId: session.examType,
        questionIndex,
        question: question.question,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
        userAnswer: selectedAnswer,
        isCorrect: selectedAnswer === question.answer
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーションバー */}
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div className="flex gap-2">
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
          
          {/* ブックマークボタン */}
          {isLoaded && (
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                isCurrentBookmarked
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-white text-slate-700 border border-slate-200 hover:shadow-md'
              }`}
            >
              <Bookmark size={18} className="sm:w-5 sm:h-5" fill={isCurrentBookmarked ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">{isCurrentBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
              <span className="sm:hidden">{isCurrentBookmarked ? '✓' : ''}</span>
            </button>
          )}
        </div>

        {/* 進捗表示 */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              問 {questionIndex + 1} / {session.questions.length}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600">
              {Math.round((questionIndex / session.questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / session.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 問題カード */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-md border border-slate-100 mb-4 sm:mb-6">
          {/* 試験名 */}
          <div className="text-xs sm:text-sm text-slate-500 mb-4">{session.examType}</div>
          
          {/* 問題文 */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 leading-relaxed">
            {question.question}
          </h2>

          {/* 選択肢 */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.answer;
              const showResult = isAnswered && (isSelected || isCorrect);

              let buttonClass =
                'w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all font-medium text-slate-700 text-sm sm:text-base ';

              if (!isAnswered) {
                buttonClass +=
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                    : 'border-slate-200 hover:border-slate-300 cursor-pointer';
              } else {
                if (isCorrect) {
                  buttonClass += 'border-green-500 bg-green-50 text-green-700';
                } else if (isSelected && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-50 text-red-700';
                } else {
                  buttonClass += 'border-slate-200 text-slate-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && handleAnswer(index)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="font-bold text-base sm:text-lg min-w-6 sm:min-w-8">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                  {showResult && isCorrect && (
                    <div className="flex justify-end mt-2">
                      <CheckCircle2 className="text-green-600" size={20} />
                    </div>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <div className="flex justify-end mt-2">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 解説 */}
          {isAnswered && (
            <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {selectedAnswer === question.answer ? (
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-2">
                    {selectedAnswer === question.answer ? '正解です！' : '残念、不正解です。'}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-3 text-sm sm:text-base">
                    <span className="font-semibold">正解：</span>
                    {String.fromCharCode(65 + question.answer)}. {question.options[question.answer]}
                  </p>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                    <span className="font-semibold block mb-2">解説：</span>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 前後ボタン */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
            <button
              onClick={() => questionIndex > 0 && router.push(`/exam/${questionIndex - 1}`)}
              disabled={questionIndex === 0}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">前の問題</span>
              <span className="sm:hidden">前</span>
            </button>
            <button
              onClick={() => router.push(`/exam/${questionIndex + 1}`)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm sm:text-base col-span-2 sm:col-span-1"
            >
              <span className="hidden sm:inline">次の問題</span>
              <span className="sm:hidden">次へ</span>
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

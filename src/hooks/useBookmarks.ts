import { useState, useEffect } from 'react';

export interface BookmarkedQuestion {
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

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    const stored = localStorage.getItem('exam-bookmarks');
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // ブックマーク追加
  const addBookmark = (question: Omit<BookmarkedQuestion, 'timestamp'>) => {
    setBookmarks((prev) => {
      const newBookmarks = [...prev, { ...question, timestamp: Date.now() }];
      localStorage.setItem('exam-bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  // ブックマーク削除
  const removeBookmark = (examId: string, questionIndex: number) => {
    setBookmarks((prev) => {
      const newBookmarks = prev.filter(
        (b) => !(b.examId === examId && b.questionIndex === questionIndex)
      );
      localStorage.setItem('exam-bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  // ブックマーク確認
  const isBookmarked = (examId: string, questionIndex: number) => {
    return bookmarks.some(
      (b) => b.examId === examId && b.questionIndex === questionIndex
    );
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    isLoaded
  };
}

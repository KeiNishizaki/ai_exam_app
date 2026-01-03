import ExamClient from "./ExamClient";

// 静的書き出しの際、どのIDをあらかじめ作るか指定（空でもビルドは通ります）
export function generateStaticParams() {
  // 0スタートのインデックスを使っているため、0〜9を事前生成（最大10問まで対応）
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
}

export default function Page() {
  return <ExamClient />;
}
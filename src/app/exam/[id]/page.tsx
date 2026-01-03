import ExamClient from "./ExamClient";

// 静的書き出しの際、どのIDをあらかじめ作るか指定（空でもビルドは通ります）
export function generateStaticParams() {
  // 0スタートのインデックスを使っているため、0も事前生成に含める
  return [{ id: "0" }, { id: "1" }, { id: "2" }]; // 必要な分だけ、または一旦これでOK
}

export default function Page() {
  return <ExamClient />;
}
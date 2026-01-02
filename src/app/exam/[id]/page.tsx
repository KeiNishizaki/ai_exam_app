import ExamClient from "./ExamClient";

// 静的書き出しの際、どのIDをあらかじめ作るか指定（空でもビルドは通ります）
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }]; // 必要な分だけ、または一旦これでOK
}

export default function Page() {
  return <ExamClient />;
}
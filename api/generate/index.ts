// @ts-nocheck
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const { examType, questionCount, difficulty, referenceText } = req.body || {};

        // 1. プロンプトで「explanation」を含めるように明示する
        const prompt = `
        # Role
        あなたは、国家試験や高度ITベンダー試験の作成を専門とする、プロの試験問題作成官です。

        # Task
        提供された資料に基づき、厳格で正確な試験問題を ${questionCount} 問作成してください。

        # Input Data
        - 試験対象: ${examType}
        - 難易度レベル: ${difficulty}（※初心者向け：基本用語の定義、試験相応：実務での適用、専門家向け：複雑なトラブルシューティングや設計）
        - 参考資料: ${referenceText || "一般的な知識に基づいて作成"}

        # Constraints (重要ルール)
        1. 選択肢の質: 
        - 誤答（ディストラクター）は、一目で間違いとわかるものではなく、学習者が迷うような「惜しい」選択肢にしてください。
        - 「すべて」「決して〜ない」などの極端な表現は避け、公平な問題にしてください。
        2. 正解の一意性: 必ず正解が1つだけに決まるように作成してください。
        3. 解説の質: なぜその選択肢が正解なのか、なぜ他が間違いなのかを、初心者にも論理的にわかるように記述してください。
        4. 形式: 必ず以下の純粋なJSON形式で出力し、他の文章は一切含めないでください。

        # Output Format
        {
        "questions": [
            {
            "question": "問題文",
            "options": ["A", "B", "C", "D"],
            "answer": 0,
            "explanation": "正解はAです。理由は...。一方でBは...のため不適切です。"
            }
        ]
        }
        `;
        // const prompt = `試験問題を作成してください。
        // 必ず以下のJSON形式のみを返し、挨拶や説明は一切含めないでください。
        // {"questions": [{"question": "問題文", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "正解の理由"}]}
        
        // 条件：
        // - タイプ：${examType}
        // - 問題数：${questionCount}
        // - 難易度：${difficulty}
        // - 参考資料：${referenceText || "なし"}
        // - 回答（answer）は、options配列のインデックス（0〜3の数値）で返してください。`;

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY || "";
        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

        const result = await client.getChatCompletions("gpt-4o-mini", [
            { role: "system", content: "あなたはJSONのみを出力する専門家です。" },
            { role: "user", content: prompt }
        ]);

        let responseText = result.choices[0].message?.content || "";
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const finalData = JSON.parse(responseText);

        // 2. データの正規化（AIが数値で返さない場合などのフォールバック）
        const normalizeQuestions = (questions: any[]) => {
            return questions.map((q) => {
                const options = Array.isArray(q.options) ? q.options : [];
                let answer = q.answer;

                // 数値でない場合の変換処理
                if (typeof answer === 'string') {
                    if (/^[A-Za-z]$/.test(answer)) {
                        answer = answer.toUpperCase().charCodeAt(0) - 65;
                    } else {
                        answer = parseInt(answer, 10);
                    }
                }
                
                return {
                    question: q.question || "問題文の取得に失敗しました",
                    options: options,
                    answer: isNaN(answer) ? 0 : answer,
                    explanation: q.explanation || "解説はありません。"
                };
            });
        };

        let bodyData = { questions: [] };
        if (Array.isArray(finalData)) {
            bodyData.questions = normalizeQuestions(finalData);
        } else if (finalData && Array.isArray(finalData.questions)) {
            bodyData.questions = normalizeQuestions(finalData.questions);
        }

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: bodyData
        };

    } catch (error: any) {
        context.log.error(error);
        context.res = { 
            status: 500, 
            body: { error: "生成失敗しました", details: error.message } 
        };
    }
};

export default httpTrigger;
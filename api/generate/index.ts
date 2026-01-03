// @ts-nocheck
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const { examType, questionCount, difficulty, referenceText } = req.body || {};

        const prompt = `試験問題を作成してください。
        必ず以下のJSON形式のみを返し、解説や挨拶は一切含めないでください。
        {"questions": [{"question": "問題文", "options": ["A", "B", "C", "D"], "answer": "正解"}]}
        
        条件：タイプは${examType}、問題数は${questionCount}、難易度は${difficulty}。
        参考資料：${referenceText || "なし"}`;

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY || "";
        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

        const result = await client.getChatCompletions("gpt-4o-mini", [
            { role: "user", content: prompt }
        ]);

        let responseText = result.choices[0].message?.content || "";

        // ★【重要】Markdownの「```json」などの装飾を削除する処理
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        // 文字列をオブジェクトに変換して返す
        const finalData = JSON.parse(responseText);

        // 正解の表現はモデル依存のため、ここで正規化する
        const normalizeQuestions = (questions: any[]) => {
            return questions.map((q) => {
                const options = Array.isArray(q.options) ? q.options : [];
                let answer = q.answer;

                if (typeof answer === 'string') {
                    const s = answer.trim();
                    // 単一のアルファベット(A,B,C...)ならインデックスに変換
                    if (/^[A-Za-z]$/.test(s)) {
                        answer = s.toUpperCase().charCodeAt(0) - 65;
                    } else if (/^\d+$/.test(s)) {
                        // 数字文字列なら数値に
                        answer = Number(s);
                    } else {
                        // 選択肢の文字列と一致するものを探す
                        const idx = options.findIndex((opt: any) => {
                            if (typeof opt === 'string') return opt.trim() === s;
                            return String(opt).trim() === s;
                        });
                        answer = idx !== -1 ? idx : 0;
                    }
                }

                if (typeof answer !== 'number' || Number.isNaN(answer) || answer < 0 || answer >= options.length) {
                    answer = 0;
                }

                // 抽出: 解説フィールドの候補を探す
                let explanation = '';
                const explKeys = ['explanation','explain','解説','explanationText','analysis','comment','解説文'];
                for (const k of explKeys) {
                    if (q[k]) {
                        explanation = String(q[k]).trim();
                        break;
                    }
                }

                // q.question に解説が埋め込まれている場合 (例: "問題文...\n解説: ...") を分離
                let questionText = q.question ?? '';
                if (!explanation) {
                    const qStr = String(questionText);
                    const m = qStr.match(/(?:\r?\n|\s)*(解説|解説：|解説:)([\s\S]*)$/);
                    if (m) {
                        questionText = qStr.slice(0, m.index).trim();
                        explanation = m[2].trim();
                    }
                }

                // 解説がまだ空で、選択肢や正解表記が問題文に混入している場合は後半を取り出す
                if (!explanation) {
                    const qStr = String(questionText);
                    // 正解: ... の直後に空行があり、その後に解説が来るパターンを探す
                    const m2 = qStr.match(/正解[:：][\s\S]*?(?:\r?\n){1,2}([\s\S]+)/);
                    if (m2) {
                        explanation = m2[1].trim();
                        // 問題文からは正解以降を切り詰める
                        questionText = qStr.replace(/正解[:：][\s\S]*/,'').trim();
                    }
                }

                // 最終フォールバック: 空文字列にする
                explanation = explanation || '';

                return {
                    question: questionText,
                    options: options.map((o:any) => (typeof o === 'string' ? o.trim() : String(o))),
                    answer,
                    explanation
                };
            });
        };

        let bodyData = finalData;
        if (Array.isArray(finalData)) {
            bodyData = { questions: normalizeQuestions(finalData) };
        } else if (finalData && Array.isArray(finalData.questions)) {
            finalData.questions = normalizeQuestions(finalData.questions);
            bodyData = finalData;
        }

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: bodyData
        };

    } catch (error: any) {
        context.log.error(error);
        context.res = { status: 500, body: { error: "JSON解析失敗", details: error.message } };
    }
};

export default httpTrigger;
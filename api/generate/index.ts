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

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: finalData 
        };

    } catch (error: any) {
        context.log.error(error);
        context.res = { status: 500, body: { error: "JSON解析失敗", details: error.message } };
    }
};

export default httpTrigger;
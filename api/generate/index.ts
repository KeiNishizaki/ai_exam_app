// @ts-nocheck
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        // フロントエンドから送られてくるデータ（body）を取得
        const { examType, questionCount, difficulty, referenceUrl, referenceText } = req.body || {};

        // 送られてきた情報を元にAIへの命令文（プロンプト）を作成
        const prompt = `
            以下の条件で試験問題を ${questionCount} 問作成してください。
            - 試験タイプ: ${examType}
            - 難易度: ${difficulty}
            ${referenceText ? `- 参考テキスト: ${referenceText}` : ""}
            ${referenceUrl ? `- 参考URL: ${referenceUrl}` : ""}
            
            レスポンスは必ず以下のJSON形式で返してください。
            {"questions": [{"question": "問題文", "options": ["A", "B", "C", "D"], "answer": "正解"}]}
        `;

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY || "";
        const deploymentId = "gpt-4o"; // Azureで設定したデプロイ名

        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

        const result = await client.getChatCompletions(deploymentId, [
            { role: "system", content: "あなたは優秀な試験作成アシスタントです。必ず指定されたJSON形式で回答してください。" },
            { role: "user", content: prompt }
        ]);

        const responseText = result.choices[0].message?.content || "";
        
        // AIの回答からJSON部分だけを抽出（念のため）
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const finalJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: finalJson // JSONオブジェクトとして返す
        };

    } catch (error: any) {
        context.log.error(error);
        context.res = {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: { error: "AI生成に失敗しました", details: error.message }
        };
    }
};

export default httpTrigger;
// @ts-nocheck
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        // フロントエンドからのリクエストボディを取得
        const { prompt } = req.body || {};

        if (!prompt) {
            context.res = { status: 400, body: "Prompt is required" };
            return;
        }

        // 環境変数の読み込み
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
        const azureApiKey = process.env.AZURE_OPENAI_API_KEY || "";
        
        // ★重要: Azureで作成した「モデルのデプロイ名」を指定してください
        // もしデプロイ名を環境変数に設定しているなら process.env.DEPLOYMENT_NAME 等に変えてください
        const deploymentId = "gpt-4o-mini"; 

        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

        // Azure OpenAIを呼び出し
        const result = await client.getChatCompletions(deploymentId, [
            { role: "system", content: "あなたは優秀な試験問題作成者です。" },
            { role: "user", content: prompt }
        ]);

        const responseText = result.choices[0].message?.content;

        // フロントエンドに結果を返す
        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { result: responseText }
        };

    } catch (error: any) {
        context.log.error("Error in generate function:", error);
        context.res = {
            status: 500,
            body: { error: "AI生成中にエラーが発生しました", details: error.message }
        };
    }
};

export default httpTrigger;
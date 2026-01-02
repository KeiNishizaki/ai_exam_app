import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import OpenAI from "openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        // Next.jsの req.json() の代わり
        const body = req.body; 

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // 環境変数は後でAzureに設定します
        });

        // ここにAI生成ロジックを記述（今のroute.tsの内容を移植）
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: body.prompt }],
        });

        context.res = {
            status: 200,
            body: { result: completion.choices[0].message.content },
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: { error: "AI生成に失敗しました" }
        };
    }
};

export default httpTrigger;
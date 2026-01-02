import { AzureOpenAI } from "openai"; // 書き方が変わりました
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { examType, referenceUrl, referenceText, questionCount, difficulty } = await req.json();

    let referenceInfo = "";

    // 1. 参考情報の取得（オプション）
    if (referenceUrl) {
      try {
        const res = await axios.get(referenceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $ = cheerio.load(res.data);
        referenceInfo = $("p, h1, h2, li").text().substring(0, 2000);
      } catch (error) {
        console.log("URLからのテキスト抽出に失敗しました。試験名のみで問題を生成します。");
      }
    } else if (referenceText) {
      referenceInfo = referenceText.substring(0, 2000);
    }

    // 2. Azure OpenAI 設定
    const client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: "2024-06-01",
      deployment: "gpt-4o-mini",
    });

    // 3. プロンプトの構築
    let prompt = `「${examType}」という試験に関する4択問題を${questionCount}問、難易度は「${difficulty}」で生成してください。`;
    
    if (referenceInfo) {
      prompt += `\n\n参考資料：\n${referenceInfo}`;
    }
    
    prompt += `\n\n必ず以下のJSON形式のみで回答してください。配列形式で、複数の問題を含める必要があります。

    [
      {"question":"問題文","options":["選択肢1","選択肢2","選択肢3","選択肢4"],"answer":0,"explanation":"解説"}
    ]`;

    // 4. AIに依頼
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "あなたは優秀な試験問題作成者です。必ずJSON形式で出力してください。" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = result.choices[0].message?.content || "[]";
    return NextResponse.json(JSON.parse(content));
    
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json({ error: "問題作成に失敗しました。" }, { status: 500 });
  }
}
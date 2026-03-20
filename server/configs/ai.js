import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// A seamless custom proxy layer mapping OpenAI SDK methods directly to native Gemini
const ai = {
  chat: {
    completions: {
      create: async (params) => {
        const modelName = params.model || process.env.OPENAI_MODEL || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        
        let promptLines = [];
        for (const msg of params.messages) {
           if(msg.role === "system") {
              // System instructions are supported natively in 1.5+ models
              // Alternatively, simple concatenation works robustly.
              promptLines.push(`Instructions you must follow perfectly:\n${msg.content}`);
           } else {
              promptLines.push(msg.content);
           }
        }
        const promptText = promptLines.join("\n\n====================\n\n");

        let generationConfig = {};
        if (params.response_format && params.response_format.type === "json_object") {
          generationConfig.responseMimeType = "application/json";
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig
        });
        
        return {
          choices: [
            { message: { content: result.response.text() } }
          ]
        };
      }
    }
  }
};

export default ai;

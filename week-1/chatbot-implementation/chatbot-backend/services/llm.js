import { AzureChatOpenAI, ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
dotenv.config();

const model = new AzureChatOpenAI({
    model: "gpt-4o",
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_VERSION,
    temperature: 0,
});

/**
 * Invoke the LLM with a prompt
 * @param {string|Array} prompt - Either a string prompt or an array of message objects
 * @returns {Promise<object>} - The LLM response
 */
export async function invoke(prompt) {
    try {
        // Handle both string prompts and message arrays
        const response = await model.invoke(prompt);
        return response;
    } catch (error) {
        console.error("Error invoking model:", error);
        throw new Error("Model invocation failed");
    }
}

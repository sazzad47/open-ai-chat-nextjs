import { Redis } from "@upstash/redis";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { type NextRequest } from "next/server";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";

const redisClient = Redis.fromEnv()

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const messages = requestBody.messages;
    const loadMessages = requestBody.loadMessages;
    const clientConvId = requestBody.convId;
  
    const convId = clientConvId || Date.now().toString();
    const redisKey = `DEFAULT:${convId}`;

    if (loadMessages) {
      try {
        const historicChat = await redisClient.lrange(redisKey, 0, -1);
        return new Response(JSON.stringify(historicChat));
      } catch (error) {
        console.error("Error fetching chat history:", error);
        return new Response("Error fetching chat history", { status: 500 });
      }
    }

    const chatHistory = new UpstashRedisChatMessageHistory({
      sessionId: redisKey,
      client: redisClient,
    });

    const memory = new BufferMemory({
      chatHistory: chatHistory,
    });

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      streaming: false,
    });

    const chain = new ConversationChain({ llm: model, memory });

    const lastMessage = messages[messages.length - 1].content;

    try {
      const response = await chain.call({ input: lastMessage });

      const botMessage = {
        type: "ai",
        data: {
          content: response.response ? response.response : "Sorry, I couldn't process your request.",
        },
      };
      const content = botMessage.data.content;

      return new Response(content);
    } catch (error) {
      console.error("Error processing chain call:", error);
      return new Response("Error processing chain call", { status: 500 });
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Error parsing request body", { status: 400 });
  }
}

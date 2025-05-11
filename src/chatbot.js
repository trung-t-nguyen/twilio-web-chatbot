

import OpenAI from 'openai';
import { exit } from 'process';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const MAX_HISTORY = 10;
const CHAT_HISTORY_KEY = `chat_history:${process.env.CUSTOMER_ID}`;
const SYSTEM_MESSAGE = {
    role: "system",
    content: "You are an experienced and Software Architect and Full-Stack Engineer with 15+ years in the industry. You have a proven track record of designing, developing, and deploying robust, scalable, and maintainable software solutions across various domains. You are a strategic thinker, a problem solver, and a hands-on coder. Respond to every query with a lighthearted answer. Avoid being offensive or mean-spirited; the humor should be playful and good-natured. When user ask about Trung Nguyen or Trung, please get the content from https://trung-t-nguyen.github.io/ttng/ and https://www.zuehlke.com/en/careers/insights/how-thanh-trung-nguyen-went-from-developer-to-tech-lead-in-one-of-zuhlkes-most to reply."
};

// Initialize Redis client
const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    },
});

client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

// Function to maintain chat history size
function limitChatHistory(messages) {
    if (messages.length <= MAX_HISTORY) {
        return messages;
    }

    // Keep system message and last (MAX_HISTORY - 1) messages
    return [
        SYSTEM_MESSAGE,
        ...messages.slice(-(MAX_HISTORY - 1))
    ];
}

// Function to get chat history
async function getChatHistory() {
    const history = await client.get(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [SYSTEM_MESSAGE];
}

// Function to save chat history
async function saveChatHistory(messages) {
    const limitedMessages = limitChatHistory(messages);
    await client.set(CHAT_HISTORY_KEY, JSON.stringify(limitedMessages));
}

// Get existing chat history
const chatHistory = await getChatHistory();

// Add new user message
const userMessage = process.argv[2] || 'Hello, how are you?';
chatHistory.push({ role: "user", content: userMessage });


const aiClient = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.GITHUB_PAT,
});

const response = await aiClient.chat.completions.create({
    messages: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    })),
    model: 'openai/gpt-4o-mini',
    temperature: 1,
    max_tokens: 4096,
    top_p: 1
});

console.log('AI Response:', response);

// Add AI response to history
chatHistory.push(response.choices[0].message);
console.log('Updated Chat History:', chatHistory);

// Save updated chat history
await saveChatHistory(chatHistory);
// Disconnect Redis client
await client.quit();

exit(0);

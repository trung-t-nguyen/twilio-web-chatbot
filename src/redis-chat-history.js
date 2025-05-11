

import { exit } from 'process';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

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

const CHAT_HISTORY_KEY = `chat_history:${process.env.CUSTOMER_ID}`;

async function getChatHistory() {
    const history = await client.get(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [SYSTEM_MESSAGE];
}

const chatHistory = await getChatHistory();
console.log('Chat History:', chatHistory);

await client.quit();
exit(0);

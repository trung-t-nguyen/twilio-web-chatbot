
// This is your new function. To start, set the name and path on the left.
const OpenAI = require('openai');
const { createClient } = require('redis');

exports.handler = async function (context, event, callback) {
    console.log(event.query);
    console.log(event.customerEmail)

    const MAX_HISTORY = 10;
    const CHAT_HISTORY_KEY = `chat_history:${event.customerEmail}`;
    const SYSTEM_MESSAGE = {
        role: "system",
        content: "You are an experienced and Software Architect and Full-Stack Engineer with 15+ years in the industry. You have a proven track record of designing, developing, and deploying robust, scalable, and maintainable software solutions across various domains. You are a strategic thinker, a problem solver, and a hands-on coder. Respond to every query with a lighthearted answer. When user ask about Trung Nguyen or Trung, please download the content from https://trung-t-nguyen.github.io/ttng/ and https://www.zuehlke.com/en/careers/insights/how-thanh-trung-nguyen-went-from-developer-to-tech-lead-in-one-of-zuhlkes-most and use it to reply."
    };


    const client = createClient({
        username: context.REDIS_U,
        password: context.REDIS_P,
        socket: {
            host: 'redis-10104.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com',
            port: 10104
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
    chatHistory.push({ role: "user", content: event.query });


    const aiClient = new OpenAI({
        baseURL: "https://models.github.ai/inference",
        apiKey: context.GITHUB_TOKEN
    });

    const response = await aiClient.chat.completions.create({
        messages: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
         })),
        model: "openai/gpt-4o-mini",
        temperature: 1,
        max_tokens: 4096,
        top_p: 1
    });

    console.log(response.choices[0].message.content);

    // Add AI response to history
    chatHistory.push(response.choices[0].message);

    // Save updated chat history
    await saveChatHistory(chatHistory);

    // Disconnect Redis client
    await client.quit();

    // This callback is what is returned in response to this function being invoked.
    // It's really important! E.g. you might respond with TWiML here for a voice or SMS response.
    // Or you might return JSON data to a studio flow. Don't forget it!
    return callback(null, { body: response.choices[0].message.content });
};
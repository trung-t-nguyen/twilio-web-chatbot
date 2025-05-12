# Twilio Web Chatbot

This project is a web-based chatbot application that integrates Twilio's messaging services with OpenAI's capabilities. It provides a chat interface for users to interact with an AI-powered bot.

Try the live demo: [Twilio Web Chatbot](https://trung-t-nguyen.github.io/ttng/)

## Features

- Real-time web chat interface - Twilio Webchat 3.0
- Integration with Twilio's converastion API
- OpenAI-powered responses
- Node.js backend server - Twilio Function

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend"
        UI[Website]
        Chat[Twilio Webchat 3.0]
    end

    subgraph "Twilio Services"
        Flow[Studio Flow]
        TF[Twilio Functions]
    end

    subgraph "Backend Services"
        AI[GitHub Copilot AI]
        Redis[(Redis Cloud)]
    end

    UI --> Chat
    Chat -->|Send Message| Flow
    Flow -->|Route Messages| TF
    TF -->|Query Context| Redis
    TF -->|Generate Response| AI
    AI -->|Return Response| TF
    TF -->|Store History| Redis
    TF -->|Return Response| Flow
    Flow -->|Process Response| Chat
    Chat -->|Display| UI

    style UI fill:#f9f,stroke:#333
    style Chat fill:#bbf,stroke:#333
    style Flow fill:#fbb,stroke:#333
    style TF fill:#bfb,stroke:#333
    style AI fill:#feb,stroke:#333
    style Redis fill:#ff9,stroke:#333
```

## Technical Stack

### Chat Interface and Management
- **Twilio Webchat 3.0** ([Documentation](https://www.twilio.com/docs/flex/developer/conversations/webchat))
  - Provides the chat UI components
  - Handles conversation orchestration

### AI Model
- **GitHub Copilot Model** ([Documentation](https://docs.github.com/en/github-models))
  - Based on `openai/gpt-4-mini`
  - Powers natural language understanding and response generation

### Backend Integration
- **Twilio Studio Flow** ([Documentation](https://www.twilio.com/docs/studio))
  - Orchestrates conversation workflows
  - Manages message routing and flow logic
  - Handles conversation state transitions
- **Twilio Functions**
  - Serverless service (similar to AWS Lambda or Azure Functions)
  - Manages integration between webchat and AI model

### Conversation Storage
- **Redis Cloud** ([Documentation](https://redis.io/cloud/))
  - Stores chat history
  - Enables contextual conversations by maintaining session state

## Prerequisites

- Node.js (v14 or higher)
- Twilio account and credentials
- OpenAI API key
- GitHub Personal Access Token

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd twilio-web-chatbot
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory follow the .env.sample

4. Run the chat-bot 
   ```bash
   npm run chat "how are you"
   ```
5. View chat history 
   ```bash
   npm run chat-history
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License.
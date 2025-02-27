# Motia

<p align="center">
  <img src="https://raw.githubusercontent.com/motiajs/motia/main/assets/logo.png" alt="Motia Logo" width="200" />
</p>

<p align="center">
  <strong>A modern, declarative workflow framework for multiple programming languages</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/motia"><img src="https://img.shields.io/npm/v/motia.svg" alt="npm version"></a>
  <a href="https://github.com/motiajs/motia/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
</p>

## What is Motia?

Motia is a lightweight, flexible framework for building complex workflows and business processes across multiple programming languages. It allows you to define, visualize, and execute workflows with a clean, declarative API in JavaScript, TypeScript, Ruby, Python, and more languages coming soon.

Key features:
- 🔄 **Declarative Workflows**: Define complex processes with a simple, readable syntax
- 🛠️ **Type-Safe**: Built with strong typing support for all supported languages
- 🔍 **Visualizable**: Inspect and debug your workflows with Motia Workbench
- 🧩 **Composable**: Build complex workflows from reusable components
- 🚀 **Multi-Language Support**: Works with JavaScript, TypeScript, Ruby, Python, with more languages coming soon
- 🌐 **Framework Agnostic**: Integrates with any framework in your language of choice

## Installation

### JavaScript/TypeScript
```sh
npm install motia
# or
yarn add motia
# or
pnpm add motia
```


```

## Quick Start

### Email Auto-Reply with Sentiment Analysis

Here's a real-world example of using Motia to create an automated email reply system with sentiment analysis:

```typescript
import { OpenAI } from 'openai';
import { z } from 'zod';
import type { EventConfig, StepHandler } from 'motia';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config: EventConfig = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribes: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support'],
  input: z.object({ subject: z.string(), body: z.string(), from: z.string() }),
};

export const handler: StepHandler<typeof config> = async (inputData, context) => {
  const { subject, body, from } = inputData;
  const { emit, logger } = context;

  const sentimentResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: `Analyze the sentiment of the following email: ${body}` }]
  });

  const sentiment = sentimentResponse.choices[0].message.content;
  
  logger.info('[EmailAutoReply] Sentiment analysis', { sentiment });
  
  emit({
    type: 'email.send',
    data: { from, subject, body, sentiment },
  });
};
```

## CLI Commands

Motia comes with a powerful CLI to help you manage your projects:

### `motia init`

Initializes a new Motia project in the current directory.

```sh
motia init
```

### `motia build`

Builds a lock file based on your current project setup which is then used by the Motia ecosystem.

```sh
motia build
```

### `motia dev`

Initiates a dev environment for your project allowing you to use Motia Workbench (visualization tool for your flows).

```sh
motia dev
```

## Visualizing Workflows

Motia Workbench provides a visual interface to inspect and debug your workflows:

```sh
motia dev
```

Then open your browser at `http://localhost:3000` to see your workflows in action.

## Language Support

Motia currently supports:
- JavaScript
- TypeScript
- Ruby
- Python

With more languages coming soon!

## Help

For more information on a specific command, you can use the `--help` flag:

```sh
motia <command> --help
```

## Documentation

For full documentation, visit [https://motia.dev/docs](https://motia.dev/docs)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/motiajs/motia/blob/main/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License.

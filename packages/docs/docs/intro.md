---
sidebar_position: 1
---

# Intro

Let's discover **Wistro in less than 5 minutes**.

## Getting Started

### Prerequisites

- **Node.js** (v16+ recommended)
- **Python** (LTS recommended)
- **pnpm** (for managing the monorepo)

### Setup

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd wistro-monorepo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy the example `.env` file:
     ```bash
     cp playground/.env.example playground/.env
     ```
   - Update the `.env` file with your credentials and API keys.

### Running the Playground

The playground allows you to test and refine workflows built using Wistro.js.

```bash
pnpm run dev
```

This command starts the following services:

- **WistroCore**: The workflow orchestrator.
- **WistroServer**: Provides HTTP endpoints for triggering workflows.
- **Playground UI**: A React-based visualization tool for workflows.

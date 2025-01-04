# Wistro Monorepo

This repository hosts the development of **Wistro.js**, a framework for building event-driven business automation workflows. The repository is structured to facilitate the iterative development and testing of the core framework and includes a playground environment for real-world use cases.

## Overview

Wistro.js aims to simplify the creation and scaling of event-driven workflows by:

- Providing a **core framework** for defining workflows as collections of testable components.
- Supporting **real-time event handling** with loose coupling between components.
- Offering tools for **UI-based workflow visualization**.
- Enabling seamless **integration with external APIs** like Google Drive and OpenAI.

### Aspirational Vision

Wistro.js strives to be:

- **Developer-Friendly**: Easy to adopt and extend.
- **Production-Ready**: Scales gracefully from prototypes to enterprise-grade workflows.
- **Integration-First**: Works seamlessly with third-party tools and services.

## Repository Structure

```
.
├── packages/                   # Core framework and supporting tools
│   ├── wistro/                  # The Wistro.js framework
│   │   ├── src/                # Source code
│   │   ├── dist/               # Compiled output
│   │   ├── package.json        # Package metadata
│   │   └── README.md           # Framework-specific documentation
│   └── other-packages/         # Placeholder for future packages
├── playground/                 # Sandbox environment for testing
│   ├── src/                    # Source code for testing and examples
│   │   ├── workflows/          # Workflow implementations
│   │   ├── traffic/            # Traffic definitions (inbound/outbound)
│   │   ├── ui/                 # Custom UI components
│   │   └── index.js            # Playground entry point
│   ├── .env.example            # Environment variable template
│   └── README.md               # Playground-specific documentation
├── pnpm-workspace.yaml         # Monorepo configuration
├── package.json                # Top-level package metadata
├── README.md                   # Monorepo overview (this file)
└── CONTRIBUTING.md             # Guidelines for contributing
```

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

## How to Contribute

### Development Workflow

1. Create a new branch for your changes:

   ```bash
   git checkout -b feature/<your-feature-name>
   ```

2. Make changes to the codebase.

   - Framework changes: Update `packages/wistro`.
   - Workflow examples: Update `playground/src/workflows`.

3. Run tests:

   ```bash
   pnpm run test
   ```

4. Commit and push your changes:

   ```bash
   git commit -m "Add <your-feature-description>"
   git push origin feature/<your-feature-name>
   ```

5. Open a pull request on GitHub.

### Code Guidelines

- Follow the existing code style (Prettier and ESLint are configured).
- Write unit tests for new features and components.
- Keep commits focused and descriptive.

## Roadmap

- Expand the set of example workflows.
- Enhance the visualization capabilities of the playground.
- Improve documentation for public release.
- Publish `wistro` to npm with comprehensive guides and examples.

## License

This project is licensed under [LICENSE_NAME].

---

For any questions or feedback, feel free to open an issue on GitHub!

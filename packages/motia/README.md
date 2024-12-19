# Motia.js

Motia.js is a powerful framework designed to simplify the creation of event-driven workflows. By enabling developers to define and connect components through events, Motia.js provides a flexible foundation for automating business processes and building scalable, maintainable systems.

## Key Features

### Event-Driven Architecture

- **Loosely Coupled Components**: Components subscribe to specific events and can emit new ones.
- **Dynamic Event Flow**: Components react dynamically to event patterns for enhanced flexibility.

### Core Modules

- **`MotiaCore`**: Central orchestrator for managing workflows, components, and events.
- **`InMemoryMessageBus`**: A lightweight, in-memory event bus for communication.
- **`MotiaServer`**: Provides HTTP endpoints for external triggers and workflow introspection.
- **`MotiaUi`**: React-based visualization tools for workflows.

### Scalable Workflow Design

- Easily define, test, and deploy modular components.
- Supports dynamic loading of workflows and components.
- Grow from prototypes to production-ready systems.

### Integration Ready

- Supports external APIs, including Google Drive and OpenAI.
- CLI tools for rapid development of workflows and components.

## Directory Structure

The following is an example directory structure for a project using Motia.js:

```
my-motia-project
├── workflows/                # Workflow definitions
│   ├── data-processing/      # Example workflow
│   │   ├── components/       # Workflow components
│   │   │   ├── validate-data/
│   │   │   │   ├── index.js  # Component logic
│   │   │   │   └── ui.jsx    # UI visualization
│   │   │   ├── split-data/
│   │   │   ├── transform-partA/
│   │   │   ├── transform-partB/
│   │   │   ├── join-data/
│   │   │   └── save-data/
│   │   ├── config.js         # Workflow configuration
│   │   └── version.json      # Workflow metadata
├── traffic/                  # HTTP traffic definitions
│   ├── inbound/              # Incoming traffic configurations
│   └── outbound/             # Outbound traffic configurations
├── ui/                       # Custom UI components
├── .env                      # Environment variables
├── package.json              # Project dependencies
└── index.js                  # Application entry point
```

## Installation

To install Motia.js as a dependency:

```bash
npm install motia
```

Or use in a monorepo setup with `pnpm`:

```bash
pnpm add motia
```

## Usage

### 1. Initializing MotiaCore

```javascript
import { MotiaCore } from "motia";

const core = new MotiaCore();
await core.initialize({
  workflowPaths: ["./workflows"],
});

console.log("MotiaCore initialized!");
```

### 2. Creating a Workflow Component

Motia's CLI can scaffold components for you:

```bash
npx motia-cli create component <workflowName> <componentName>
```

This creates a new component with the following structure:

- `index.js`: The logic for handling events.
- `ui.jsx`: A React-based visualization for the component.

#### Example: `index.js`

```javascript
export const subscribe = ["example.event"];
export const emits = ["example.response"];

export default async function exampleHandler(input, emit) {
  console.log("Received input:", input);
  await emit({ type: "example.response", data: { success: true } });
}
```

### 3. Starting the Server

MotiaServer provides HTTP routes for triggering workflows:

```javascript
import { MotiaServer } from "motia";

const server = new MotiaServer();
await server.initialize(core, ["./traffic/inbound"]);
console.log("Server listening on port 3000");
```

## Visualization with MotiaUi

MotiaUi allows you to visualize workflows using React Flow. To include MotiaUi in your project:

```javascript
import { MotiaUi } from "motia/ui";

const nodeTypes = MotiaUi.getNodeTypes();
```

Use `ReactFlow` to display workflows in a graphical format.

## Example Workflow

Here’s an example of a data-processing workflow:

1. **Upload Data**: Triggered by a webhook.
2. **Validate Data**: Ensures incoming data meets requirements.
3. **Split Data**: Divides data for parallel processing.
4. **Transform Data**: Processes parts of the data.
5. **Join Data**: Merges transformed parts.
6. **Save Data**: Finalizes and stores processed data.

## Configuration

Motia.js uses environment variables for configuration:

- `GOOGLE_CREDENTIALS`: JSON credentials for Google Drive API.
- `OPENAI_API_KEY`: API key for OpenAI.
- `POLICY_RULES_FILE_ID`: File ID for compliance rules.

## Roadmap

- **Testing**: Add support for a full featured test suite.
- **Enhanced Scheduler**: Add support for cron expressions.
- **Improved Logging**: Provide detailed debug logs.
- **Error Handling**: Better retry and failure strategies.
- **Comprehensive Documentation**: Examples, tutorials, and API references.

## License

Motia.js is licensed under [LICENSE_NAME].

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for details.

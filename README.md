# Motia.js Framework Repository

## Overview

This repository is dedicated to developing, refining, and testing the **Motia.js** framework. Motia.js is designed to simplify the creation of event-driven business automation workflows. The ultimate goal is to publish **Motia.js** as a standalone npm package, while the `src` directory serves as a sandbox for experimentation and implementation of real-world workflows.

### Aspirational Vision for Motia.js

Motia.js is a framework for building event-driven business automations that start simple but scale gracefully into production-grade systems. At its core, Motia.js helps define workflows as collections of small, testable components reacting to well-defined events. It:

- **Simplifies Workflow Design**: Quickly spin up logic, integrate external triggers, and schedule time-based tasks.
- **Encourages Maintainability**: Encourages incremental improvements and ensures high quality through testing and validation.
- **Scales**: Designed to grow from prototypes to enterprise-ready solutions.

## Repository Structure

### 1. **`motia.js`**

The heart of the repository, this file contains the core framework logic, including:

- **Event Bus**: Facilitates event-driven communication between components.
- **MotiaCore**: Central orchestrator that manages workflows, components, and events.
- **MotiaServer**: Integrates HTTP endpoints with the event-driven system.
- **VersionControl**: Tracks workflow versions and metrics.

The goal of this repo is to refine this framework iteratively and eventually publish it as a package.

### 2. **`src`**

This directory implements and tests the functionality of `motia.js` through real-world use cases. It serves as both a sandbox and a validation environment.

#### Key Subdirectories:

- **`workflows`**: Contains example workflows demonstrating how to use the Motia.js framework.
- **`traffic`**: HTTP traffic definitions used by `MotiaServer`.
- **`components`**: Modular pieces of workflows, each reacting to specific events.
- **`test-*` Scripts**: Scripts to validate external integrations, such as Google Drive and OpenAI connections.

### 3. **`package.json`**

Defines the npm scripts and dependencies required for the repository. Key scripts include:

- **`npm start`**: Initializes `MotiaCore`, `MotiaServer`, and `MotiaScheduler`.

### 4. **Utility Scripts**

- **`simulate-webhook.sh`**: Sends a mock webhook to simulate document uploads.
- **`test-drive-connection.js`**: Validates integration with Google Drive.
- **`test-openai-connection.js`**: Tests connectivity and functionality with OpenAI's GPT API.

### Flow Overview:

1. **Document Upload**: A webhook triggers a `doc.uploaded` event.
2. **Fetch Content**: Document content is retrieved from Google Drive.
3. **Request Rules**: Compliance rules are fetched.
4. **Classify Document**: OpenAI GPT evaluates compliance and suggests changes if needed.
5. **Approval/Escalation**: Based on classification, the document is approved or escalated.
6. **Logging**: All events are logged for debugging.

## Key Concepts in Motia.js

- **Event-Driven Architecture**: Events trigger component actions, creating loosely coupled workflows.
- **Dynamic Loading**: Workflows, traffic, and schedules are loaded dynamically at runtime.
- **External Integrations**: Works seamlessly with APIs like Google Drive and OpenAI.
- **Versioning**: Ensures workflows are incrementally improved and versioned.

## Goals for the Repository

1. Refine `motia.js` to meet production standards.
2. Test and validate the framework through example workflows in `src`.
3. Publish `motia.js` as an npm package with comprehensive documentation and examples.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - `GOOGLE_CREDENTIALS`: JSON credentials for Google Drive API.
   - `OPENAI_API_KEY`: API key for OpenAI.
   - `POLICY_RULES_FILE_ID`: File ID of compliance rules on Google Drive.

4. Start the application:
   ```bash
   npm start
   ```

## Future Improvements

- Expand testing coverage for all components and workflows.
- Enhance scheduler to support cron expressions.
- Improve error handling and logging mechanisms.
- Add detailed documentation and examples for the npm package release.

## License

This project is licensed under [LICENSE_NAME].

---

This repository is a living document of the journey toward building and perfecting Motia.js. Feel free to explore, experiment, and contribute to its evolution!

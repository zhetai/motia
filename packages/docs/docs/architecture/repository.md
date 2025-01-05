---
sidebar_position: 3
---

# Repository Structure

The wistro repo is structured in the following way

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

# MVP

## Terminology

- steps (not components)
- flows (not workflows)
- events: an event is the result of emitting a topic with a message as its payload
- topic: a topic is what gets broadcasted in the event manager and we define inside subscribes and emits, a topic can have a payload which is defined as a message. topics are defined in triggers and steps under the emits or subscribes config
- messages: the payload for a topic, these will be type-safe on compile and runtime
- triggers: rest api endpoints or cron jobs that emit a topic with a message (if applies)
- state adapters: implementations of a state manager that can be provided through configuration in order to override the default (file storage cache) state manager
- core: system that takes in the lock file, and repo and wires up the system, primary concern is steps and the orchestration of steps (only knows about flows for tracing, logging and providing UI with what it needs). it is in charge of providing a development environment with a server that hosts the workbench and the triggers which allow access to trigger flows
- workbench: local UI for visualization of flows, logging, debugging, eval?, etc
- hub: Comercial product for

## wistro-core

- Dead simple to get running both local and prod with minimal required config
- One command install, run dev, deploy scripts
- A project must have a /src folder
- Any file inside of /src that has `*.step.*` will be registered as a step
  - These steps will be considered registered, listen for events
- steps can be written in JS, TS, Python or Go
- Step files must have a config defined
- core runs off of a wistro.yml.lock file which defines everything we need to spin up the project for dev and for prod
- A project must have a wistro.yml or wistro.json file (this might actually be optional now that I look at what is in here)
  - Optionally define api endpoints that emit events
  - Optionally define cron jobs that emit events
  - Optionally define state adapter
  - Optionally define flows (name and description of the flow)
- state defaults to a file system solution in dev if no adapter is provided in wistro.yml
- flows are defined in two places. In the wistro.yml (name, id and description) and in the config of the components using the `flows: []` prop
- flows are arbitrary and do not change how the actual system runs. They are only for UI, logging, tracing and help break up the project into reasonable chunks
- flows require a trigger, either a api endpoint or a cron job or an emit from another step
- No-Op components: These represent something done outside of the system. Generally these would be either some human or extrernal system action. They would be have virtual connections to triggers or to steps for visualization purposes

## Eval, test, data sampling

- Users should be able to unit test their steps
- Users should be able to e2e/integration test thier components
- Users shoudl be able to eval their components
  - Eval will be scenario style testing where you can provide many sample data and run live evals where the results are recorded and measured against the version.
- Users should be able to unit, e2e and eval flows

## Workbench

- Be able to trigger a flow
- Work flow visualization
  - Be able to see a flow in a graph
  - Observability through tracing (Be able to see what happened in a specific flow run logs, which steps were triggered with inputs and emitted events)
  - Test/eval in UI?

## Security/Compliance

- Event manager data integrity and security, we need to account for data encryption and consider patters to avoid cross polination of messages or exposure of messages within the event manager. If I am a fintech startup using wistro event manager, I want to be guaranteed the messages broadcasted are not going to be exposed or become easily acessible to other flows.

## Authentication

- devs should be able to configure OIDC or other auth providers on the webhook

## Hub

- Logging and observability
- Should be able to see all flows and their runs

### Deployments and versioning

- Environment variables configuration
- Upstream environments (staging, prod)
- Deployments should be one line command and auto integrate with github/gitlab/etc like vercel
- All versions should be visible in Hub UI and users should be able to configure traffic for versions they want to test (e.g. 25% of traffic to v1, 25% to v2, 50% to v3)
- Authentication: devs should be able to configure OIDC or other auth providers on the webhook
- Eval, test, data sampling
- Users should be able to visualize metrics and be able to compare metrics between versions
- Users should be able to add a specific run as a sample dataset to be able to test and eval flows
- Wistro CLI should be able to authenticate with Hub to grab datasamples and run flows locally against them to compare results

## Overall Conventions/Best Practices

- steps and flows (name, description) are written in a way that non-technical folks can read/understand them
  - "Document uploaded to "Policy" folder in Google Drive" not: "api/google-drive/upload"
  - The technical details CAN be displayed as well but we need the non-tech level description of what is happening in a flow

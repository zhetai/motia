# MVP

## Terminology

- steps (not components)
- flows (not workflows)
- events: The emit calls that can be evoked from API, triggers or steps
- messages: The payload that is subscribed to by steps. These will be type-safe on compile and runtime
- core: system that takes in the lock file, and repo and wires up the system, Primary concern is steps and the orchistration of steps (only knows about flows for tracing, logging and providing UI with what it needs
- ui: Local UI for visualization of flows, logging, debugging, eval?, etc
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

- Users should be able to visualize metrics and be able to compare metrics between versions
- Users should be able to add a specific run as a sample dataset to be able to test and eval workflows
- Wistro CLI should be able to authenticate with Hub to grab datasamples and run workflows locally against them to compare results
- Users should be able to unit test their steps
- Users should be able to e2e/integration test thier components
- Users shoudl be able to eval their components
  - Eval will be scenario style testing where you can provide many sample data and run live evals where the results are recorded and measured against the version.
- Users should be able to unit, e2e and eval flows

## UI

## Logging and observability

- Should be able to see all workflows and their runs (local and on hub)
-

## Deployments and versioning

- Environment variables configuration
- Different environments (dev, staging, prod)
- Deployments should be one line command and auto integrate with github/gitlab/etc like vercel
- All versions should be visible in Hub UI and users should be able to configure traffic for versions they want to test (e.g. 25% of traffic to v1, 25% to v2, 50% to v3)

## Authentication

- devs should be able to configure OIDC or other auth providers on the webhook

## Hub

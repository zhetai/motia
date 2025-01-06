# MVP

## wistro-core

- Dead simple to get running both local and prod with minimal required config
- One command install, run dev, deploy scripts
- A project must have a /src folder
- Any file inside of /src that has `*.step.*` will be registered as a step
- steps can be written in JS, TS, Python or Go
- Step files must have a config defined
- core runs off of a wistro.yml.lock file which defines everything we need to spin up the project for dev and for prod
- A project must have a wistro.yml or wistro.json file (this might actually be optional now that I look at what is in here)
  - Optionally define api endpoints that emit messages
  - Optionally define cron jobs that emit messages
  - Optionally define state adapter
  - Optionally define flows (name and description of the flow)
- state defaults to a file system solution in dev if no adapter is provided in wistro.yml

## Test

## Eval

## UI

## Hub

-

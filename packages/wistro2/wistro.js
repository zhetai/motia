#!/usr/bin/env node
require('dotenv/config')

const path = require('path')
const fs = require('fs')
const { parse } = require('yaml')
const { EventManager } = require('./EventManager')
const { createServer } = require('./server')
const { createWorkflowHandlers } = require('./createWorkflowHandlers')

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' }
});

function buildWorkflows() {
  // Read all workflow folders under /flows directory
  const flowsDir = path.join(process.cwd(), 'flows')
  const workflows = []

  // Check if flows directory exists
  if (!fs.existsSync(flowsDir)) {
    console.log('No /flows directory found')
    return []
  }

  // Get all workflow folders
  const workflowFiles = fs.readdirSync(flowsDir, { withFileTypes: true })
    .filter(({ name }) => name.endsWith('.ts')) // let's use only TS files for now
    .map(({ name }) => name)

  for (const file of workflowFiles) {
    const { config } = require(path.join(flowsDir, file))
    workflows.push({ config, file })
  }

  return workflows
}

async function main() {
  console.log('Current working directory is:', process.cwd())
  // 1) Read your new config file
  const configYaml = fs.readFileSync(path.join(process.cwd(), 'config.yml'), 'utf8')
  const config = parse(configYaml) 

  // let's build the workflows with the file system scanning
  const workflows = buildWorkflows()

  const eventManager = new EventManager({
    ...config.messageBus.config, // we're supporting only redis for now
    prefix: "wistro:events:",
  });
  await eventManager.initialize();

  const server = createServer(config.api, eventManager)
  createWorkflowHandlers(workflows, eventManager)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('[playground/index] Shutting down...')
    server.close()
    eventManager.cleanup()
    process.exit(0)
  })
}

main().catch(console.error)

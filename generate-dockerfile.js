#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Check if Dockerfile already exists in current directory
const dockerfilePath = path.join(process.cwd(), 'Dockerfile')

if (fs.existsSync(dockerfilePath)) {
  console.log('Dockerfile already exists')
  process.exit(1)
}

// Dockerfile content as specified
const dockerfileContent = `# Specify platform to match your target architecture
FROM --platform=linux/arm64 motiadev/motia-docker:latest

# Install Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Move application files
COPY . .

# Enable the following lines if you are using python steps!!!
# # Setup python steps dependencies
# RUN npx motia@latest install

# Expose outside access to the motia project
EXPOSE 3000

# Run your application
# TODO: update dev for start when the start command is ready
CMD ["npm", "run", "start"]
`

// Write the Dockerfile
try {
  fs.writeFileSync(dockerfilePath, dockerfileContent)
  console.log('Dockerfile generated successfully!')
} catch (error) {
  console.error('Error generating Dockerfile:', error.message)
  process.exit(1)
}

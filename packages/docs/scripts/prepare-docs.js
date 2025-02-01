const fs = require('fs/promises');
const path = require('path');

async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(res) : res;
  }));
  return files.flat();
}

async function getContentFromMdx(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

async function prepareDocs() {
  try {
    // Create dist directory if it doesn't exist
    const distDir = path.join(process.cwd(), 'dist');
    try {
      await fs.access(distDir);
    } catch {
      await fs.mkdir(distDir);
    }

    // Get all markdown files from content/docs
    const contentDir = path.join(process.cwd(), 'content/docs');
    const allFiles = await getAllFiles(contentDir);
    const mdFiles = allFiles.filter(file =>
      file.endsWith('.md') || file.endsWith('.mdx')
    );

    // Process each file
    let combinedContent = '';
    for (const file of mdFiles) {
      const relativePath = path.relative(contentDir, file);
      const content = await getContentFromMdx(file);
      combinedContent += `---\n# File: docs/${relativePath}\n\n${content}\n\n---\n\n`;
    }

    // Write to llm-docs.txt
    const docsPath = path.join(distDir, 'llm-docs.txt');
    await fs.writeFile(docsPath, combinedContent);

    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir);
    }

    // Write to docs-content.json
    const outputPath = path.join(publicDir, 'docs-content.json');
    await fs.writeFile(outputPath, JSON.stringify({ content: combinedContent }, null, 2));

    console.log('✅ Successfully prepared docs content for deployment');
  } catch (error) {
    console.error('Error preparing docs:', error);
    process.exit(1);
  }
}

prepareDocs();
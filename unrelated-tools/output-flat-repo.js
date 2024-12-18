import fs from "fs";
import path from "path";
import ignore from "ignore";

// Maximum file size to include in the output (in bytes)
const MAX_FILE_SIZE = 20024 * 20024;

// Initialize the ignore parser
const ig = ignore();

/**
 * Load .gitignore file and set up the ignore rules.
 * @param {string} repoPath - The root path of the repository.
 */
export function loadGitignore(repoPath) {
  const gitignorePath = path.join(repoPath, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    ig.add(gitignoreContent);
    console.log("Loaded .gitignore rules");
  } else {
    console.warn(".gitignore not found. Proceeding without it.");
  }

  // Always ignore `node_modules` and files/directories starting with `.`
  ig.add([
    "*node_modules/",
    ".*",
    "*lock.*",
    "flat-motia.txt",
    "/unrelated-tools/",
    "*dist*",
  ]);
}

/**
 * Recursively traverse a directory and write its file contents to an output file.
 * @param {string} dirPath - The path of the directory to traverse.
 * @param {fs.WriteStream} outputStream - The writable stream for the output file.
 * @param {string} repoRoot - The root path of the repository.
 */
export function traverseDirectory(dirPath, outputStream, repoRoot) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(repoRoot, fullPath);

    // Debug log: current file being processed
    console.log(`Processing: ${fullPath}`);

    // Sanity check: Ensure we're not traversing outside of the repo root
    if (!fullPath.startsWith(repoRoot)) {
      console.warn(`Skipping file outside repo root: ${fullPath}`);
      continue;
    }

    // Skip files/directories ignored by .gitignore or explicitly added rules
    if (ig.ignores(relativePath)) {
      console.log(`Ignored by .gitignore: ${relativePath}`);
      continue;
    }

    // Skip files and directories starting with `.`
    if (entry.name.startsWith(".")) {
      console.log(`Skipped hidden file or directory: ${entry.name}`);
      continue;
    }

    if (entry.isDirectory()) {
      traverseDirectory(fullPath, outputStream, repoRoot);
    } else if (entry.isFile()) {
      try {
        const stats = fs.statSync(fullPath);

        if (stats.size > MAX_FILE_SIZE) {
          outputStream.write(
            `  ${relativePath} (Skipped - File too large: ${stats.size} bytes)\n\n`
          );
        } else {
          // Write file path and contents
          outputStream.write(`  File: ${relativePath}\n`);
          outputStream.write(`  --- Start of ${entry.name} ---\n`);
          const content = fs.readFileSync(fullPath, "utf8");
          outputStream.write(content);
          outputStream.write(`\n  --- End of ${entry.name} ---\n\n`);
        }
      } catch (error) {
        outputStream.write(
          `  ${relativePath} (Error reading file: ${error.message})\n\n`
        );
      }
    }
  }
}

/**
 * Main function to export a repository structure and contents to a flat text file.
 * @param {string} repoPath - The path of the repository to export.
 * @param {string} outputFilePath - The path of the output text file.
 */
export function exportRepoToFlatFile(repoPath, outputFilePath) {
  const resolvedRepoPath = path.resolve(repoPath); // Ensure absolute path
  const outputStream = fs.createWriteStream(outputFilePath, {
    flags: "w",
    encoding: "utf8",
  });

  console.log(`Starting export from: ${resolvedRepoPath}`);
  console.log(`Writing output to: ${outputFilePath}`);

  try {
    loadGitignore(resolvedRepoPath);
    traverseDirectory(resolvedRepoPath, outputStream, resolvedRepoPath);
    console.log(`Repository exported successfully to ${outputFilePath}`);
  } catch (error) {
    console.error(`Error exporting repository: ${error.message}`);
  } finally {
    outputStream.end();
  }
}

// Example usage
const repoPath = "./";
const outputFilePath = "./unrelated-tools/flat-motia.txt";
exportRepoToFlatFile(repoPath, outputFilePath);

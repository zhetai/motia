import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkInstall } from 'fumadocs-docgen';

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [
        remarkInstall,
        {
          packageManagers: [
            {
              name: 'pnpm',
              command: (cmd: string) => cmd.replace('npm install', 'pnpm add'),
            },
            {
              name: 'yarn',
              command: (cmd: string) => cmd.replace('npm install', 'yarn add'),
            },
            {
              name: 'npm',
              command: (cmd: string) => cmd,
            },
            {
              name: 'bun',
              command: (cmd: string) => cmd.replace('npm install', 'bun add').replace('-D', '--dev'),
            }
          ]
        },
      ],
    ],
  }
});

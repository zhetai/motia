import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import GitHubStarButton from '../components/GitHubStarButton';
import GitHubIcon from '../components/GitHubIcon';
import DiscordIcon from '../components/DiscordIcon';
import MotiaHubButton from '@/components/MotiaHubButton'

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    transparentMode: 'none',
    title: (
      <div className="inline-flex items-center gap-1">
        <img src="/logos/logo-black.svg" alt="Motia Icon" className="h-5 dark:hidden" />
        <img src="/logos/logo-white.svg" alt="Motia Icon" className="h-5 hidden dark:block" />
      </div>
    ),
  },
  links: [
    {
      text: 'Docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: <MotiaHubButton/>,
      url: '#',
      active: 'nested-url',
    },
    // Add GitHub and Discord links with icons
    {
      text: (
        <span className="inline-flex items-center gap-2">
          <DiscordIcon />
        </span>
      ),
      url: 'https://discord.gg/nJFfsH5d6v',
      active: 'nested-url',
    },
    {
      text: (
        <span className="inline-flex items-center gap-2">
          <GitHubIcon />
        </span>
      ),
      url: 'https://github.com/MotiaDev/motia',
      active: 'nested-url',
    },
    {
      type: 'custom',
      children: <GitHubStarButton />,
    },
  ],
};
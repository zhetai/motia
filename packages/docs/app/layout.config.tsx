import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import GitHubStarButton from '../components/GitHubStarButton';
import GitHubIcon from '../components/GitHubIcon';
import DiscordIcon from '../components/DiscordIcon';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    transparentMode: 'top',
    title: (<div className="inline-flex items-center gap-1 ">
      <img src="/logos/logo-white.svg" alt="Motia Icon" className="h-5" />
    </div>),
  },
  links: [
    {
      text: 'Docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: (
        <span className="inline-flex items-center gap-2">
          MotiaHub
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Coming Soon
          </span>
        </span>
      ),
      url: '#',
      active: 'nested-url',
    },
    {
      text: 'Contact',
      url: '/contact',
      active: 'nested-url',
    },
    // Add GitHub and Discord links with icons
    {
      text: (
        <span className="inline-flex items-center gap-2">
          <DiscordIcon />
        </span>
      ),
      url: 'https://discord.gg/sXbs97D8',
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
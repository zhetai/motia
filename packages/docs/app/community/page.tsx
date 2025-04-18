export const metadata = {
  title: {
    template: '%s | motia',
    default: 'Motia Community – Join & Collaborate',
  },
  description:
    'Connect with fellow developers, share ideas and build together with Motia. Join our Discord, contribute on GitHub, and explore community-driven.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Motia Community – Join & Collaborate',
    description:
      'Connect with fellow developers, share ideas and build together with Motia. Join our Discord, contribute on GitHub, and explore community-driven.',
    url: 'https://motia.dev/community',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motia Community – Join & Collaborate',
    description:
      'Connect with fellow developers, share ideas and build together with Motia. Join our Discord, contribute on GitHub, and explore community-driven.',
  },
};

export default function CommunityPage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">Community</h1>
      <p className="text-fd-muted-foreground">
        Let&apos;s build some cool stuff together!
      </p>
    </main>
  );
}

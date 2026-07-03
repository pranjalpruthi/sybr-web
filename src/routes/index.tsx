import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

// Landing Page Components
import { Hero } from '@/components/hero';
import { FeatureCards } from '@/components/feature-cards';
import { PipelineFlow } from '@/components/pipeline-flow';
import { FileTreeSection } from '@/components/file-tree';
import { CodeShowcase } from '@/components/code-showcase';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col min-h-screen">
        <Hero />
        <FeatureCards />
        <PipelineFlow />
        <FileTreeSection />
        <CodeShowcase />
      </main>
    </HomeLayout>
  );
}

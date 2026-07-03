import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

// Landing Page Components
import { Hero } from '@/components/hero';
import { WorkflowShowcase } from '@/components/workflow-showcase';
import { PipelineFlow } from '@/components/pipeline-flow';
import { FileTreeSection } from '@/components/file-tree';
import { CodeShowcase } from '@/components/code-showcase';
import { SupportedBy } from '@/components/supported-by';
import { TeamSection } from '@/components/team-section';
import { StatsSection, LandingFooter } from '@/components/landing-footer';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex min-h-screen flex-col">
        <Hero />
        <WorkflowShowcase />
        <PipelineFlow />
        <FileTreeSection />
        <CodeShowcase />
        <SupportedBy />
        <TeamSection />
        <StatsSection />
        <LandingFooter />
      </main>
    </HomeLayout>
  );
}

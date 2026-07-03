import { createFileRoute } from '@tanstack/react-router';
import { AnalysisForm } from '@/components/analysis-form';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/analysis')({
  component: Analysis,
});

function Analysis() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Run Sybr Analysis</h1>
            <p className="text-muted-foreground text-lg">
              Configure and submit your synteny block discovery and ancestral genome reconstruction job.
            </p>
          </div>
          <AnalysisForm />
        </main>
      </div>
    </HomeLayout>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { SybrDashboard } from '@/components/sybr/dashboard';

export const Route = createFileRoute('/analysis')({
  component: Analysis,
});

function Analysis() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="container mx-auto max-w-7xl flex-1 px-4 py-10">
          <div className="mb-8">
            <h1 className="mb-3 text-4xl font-heading font-bold text-foreground">
              Run Sybr Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Synteny block discovery · evolutionary breakpoint identification · ancestral genome
              reconstruction — powered by the SYBR pipeline API.
            </p>
          </div>
          <SybrDashboard />
        </main>
      </div>
    </HomeLayout>
  );
}

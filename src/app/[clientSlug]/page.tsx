import { notFound } from 'next/navigation';
import { getClientConfig, getAllClientSlugs } from '@/lib/clients';
import HireForm from '@/components/HireForm';

export async function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ clientSlug: slug }));
}

export async function generateMetadata({ params }: { params: { clientSlug: string } }) {
  const config = getClientConfig(params.clientSlug);
  if (!config) return {};
  return {
    title: `${config.formTitle} — ${config.clientName}`,
    description: `Complete the ${config.formTitle} for ${config.clientName}.`,
  };
}

export default function ClientPage({ params }: { params: { clientSlug: string } }) {
  const config = getClientConfig(params.clientSlug);
  if (!config) notFound();

  return (
    <main
      className="min-h-screen bg-gray-50"
      style={{ '--primary': config.primaryColor, '--accent': config.accentColor } as React.CSSProperties}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-8">
          {config.logo && (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.logo} alt={config.clientName} className="h-16 w-auto" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: config.primaryColor }}>
            {config.clientName}
          </h1>
          <p className="text-gray-600 mt-1 text-lg">{config.formTitle}</p>
        </header>
        <HireForm config={config} />
      </div>
    </main>
  );
}

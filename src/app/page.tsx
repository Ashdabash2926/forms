import { getAllClientSlugs } from '@/lib/clients';
import Link from 'next/link';

export default function Home() {
  const slugs = getAllClientSlugs();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hire Agreement Forms</h1>
        <p className="text-gray-500 mb-6">Select a client to continue.</p>
        <div className="space-y-3">
          {slugs.map((slug) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors"
            >
              {slug}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

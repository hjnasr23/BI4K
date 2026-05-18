import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-primary mb-4">404 — Page introuvable</h1>
      <p className="text-foreground/70 mb-8 max-w-md">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link href="/" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors">
        ← Retour à l'accueil
      </Link>
    </main>
  );
}

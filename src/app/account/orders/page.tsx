import Link from 'next/link';

export default function OrdersPage() {
  const fakeOrders = [
    { id: "CMD-1712345678", date: "5 Avril 2025", status: "Livré", itemCount: 2, total: 39.98 },
    { id: "CMD-1712399000", date: "15 Avril 2025", status: "En cours", itemCount: 1, total: 19.99 },
    { id: "CMD-1714000000", date: "25 Avril 2025", status: "En attente", itemCount: 3, total: 67.97 },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Livré': return <span className="badge-green">{status}</span>;
      case 'En cours': return <span className="badge-blue">{status}</span>;
      case 'En attente': return <span className="badge-orange">{status}</span>;
      case 'Annulé': return <span className="badge-red">{status}</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-primary font-bold hover:underline">← Mon compte</Link>
        <h1 className="text-3xl font-bold">Mes commandes</h1>
      </div>

      <div className="space-y-4">
        {fakeOrders.map(order => (
          <div key={order.id} className="bg-card-bg border border-card-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-lg">{order.id}</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="text-foreground/70 text-sm">
                Passée le {order.date} • {order.itemCount} article(s)
              </div>
            </div>
            
            <div className="flex items-center gap-6 justify-between md:justify-end">
              <span className="font-bold text-xl">{order.total.toFixed(2)} €</span>
              <button className="px-4 py-2 border border-card-border rounded-full font-medium hover:border-primary hover:text-primary transition-colors">
                Voir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

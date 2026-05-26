"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface LigneCommande {
    id: string;
    product_id: string | null;
    design_id: string;
    customization_coordinates: Record<string, any>;
    quantity: number;
    price_unit: number;
    preview_url: string;
    created_at: string;
}

interface Commande {
    id: string;
    user_id: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    total_price: number;
    order_notes: string | null;
    shipping_address: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    LigneCommande?: LigneCommande[];
}

export default function OrdersDashboard() {
    const router = useRouter();
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCommandes = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    router.push("/login");
                    return;
                }

                const token = session.access_token;
                const response = await fetch("http://127.0.0.1:8000/orders/commande", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch orders");
                const data = await response.json();
                setCommandes(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchCommandes();
    }, [router]);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/20 text-yellow-300";
            case "confirmed":
                return "bg-blue-500/20 text-blue-300";
            case "shipped":
                return "bg-brand-yellow/20 text-brand-yellow";
            case "delivered":
                return "bg-green-500/20 text-green-300";
            case "cancelled":
                return "bg-red-500/20 text-red-300";
            default:
                return "bg-gray-500/20 text-gray-300";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return "En attente";
            case "confirmed":
                return "Confirmée";
            case "shipped":
                return "Expédiée";
            case "delivered":
                return "Livrée";
            case "cancelled":
                return "Annulée";
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-foreground flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 container mx-auto px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-2">Mes Commandes</h1>
                        <p className="text-gray-400">Consultez et gérez l&apos;historique de vos commandes</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center min-h-64">
                            <div className="animate-spin">
                                <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && commandes.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📭</div>
                            <h2 className="text-2xl font-semibold mb-2">Aucune commande</h2>
                            <p className="text-gray-400 mb-8">Vous n&apos;avez pas encore de commandes.</p>
                            <button
                                onClick={() => router.push("/upload")}
                                className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 rounded-lg transition"
                            >
                                Créer une nouvelle commande
                            </button>
                        </div>
                    )}

                    {/* Orders Grid */}
                    {!loading && !error && commandes.length > 0 && (
                        <div className="space-y-6">
                            {commandes.map((commande) => (
                                <div
                                    key={commande.id}
                                    className="bg-[#1a1a1e] border border-gray-800 rounded-lg overflow-hidden hover:border-brand-blue/50 transition group cursor-pointer"
                                    onClick={() => {
                                        setSelectedCommande(commande);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <div className="p-6">
                                        {/* Order Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1">
                                                    Commande #{commande.id.substring(0, 8).toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-gray-400">{formatDate(commande.created_at)}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(commande.status)}`}>
                                                {getStatusLabel(commande.status)}
                                            </span>
                                        </div>

                                        {/* Order Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre d&apos;articles</p>
                                                <p className="text-xl font-semibold">{commande.LigneCommande?.length || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix total</p>
                                                <p className="text-xl font-semibold">{commande.total_price.toFixed(2)} €</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dernière mise à jour</p>
                                                <p className="text-sm">{formatDate(commande.updated_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Action</p>
                                                <button
                                                    className="text-brand-yellow hover:text-brand-yellow/80 text-sm font-medium"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCommande(commande);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    Voir détails →
                                                </button>
                                            </div>
                                        </div>

                                        {/* Preview Thumbnails */}
                                        {commande.LigneCommande && commande.LigneCommande.length > 0 && (
                                            <div className="flex gap-2">
                                                {commande.LigneCommande.slice(0, 5).map((ligne) => (
                                                    <div key={ligne.id} className="relative w-16 h-16 rounded overflow-hidden bg-gray-900">
                                                        {ligne.preview_url && (
                                                            <img
                                                                src={ligne.preview_url}
                                                                alt="Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                                {commande.LigneCommande.length > 5 && (
                                                    <div className="w-16 h-16 rounded bg-gray-800 flex items-center justify-center text-sm text-gray-400 font-medium">
                                                        +{commande.LigneCommande.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Detail Modal */}
            {isModalOpen && selectedCommande && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-[#1a1a1e] border border-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[#1a1a1e] border-b border-gray-800 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                Commande #{selectedCommande.id.substring(0, 8).toUpperCase()}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Statut</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedCommande.status)}`}>
                                        {getStatusLabel(selectedCommande.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Prix total</p>
                                    <p className="text-2xl font-bold">{selectedCommande.total_price.toFixed(2)} €</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Créée le</p>
                                    <p className="text-sm">{formatDate(selectedCommande.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mise à jour</p>
                                    <p className="text-sm">{formatDate(selectedCommande.updated_at)}</p>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedCommande.order_notes && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                                    <p className="text-sm bg-gray-900 p-3 rounded">{selectedCommande.order_notes}</p>
                                </div>
                            )}

                            {/* Shipping Address */}
                            {selectedCommande.shipping_address && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Adresse de livraison</p>
                                    <div className="text-sm bg-gray-900 p-3 rounded">
                                        {Object.entries(selectedCommande.shipping_address).map(([key, value]) => (
                                            <p key={key}>{value}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Lines */}
                            {selectedCommande.LigneCommande && selectedCommande.LigneCommande.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Articles ({selectedCommande.LigneCommande.length})</p>
                                    <div className="space-y-3">
                                        {selectedCommande.LigneCommande.map((ligne) => (
                                            <div key={ligne.id} className="flex gap-4 p-3 bg-gray-900 rounded">
                                                {ligne.preview_url && (
                                                    <img
                                                        src={ligne.preview_url}
                                                        alt="Preview"
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium mb-1">
                                                        Article #{ligne.id.substring(0, 8).toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mb-2">
                                                        Quantité: {ligne.quantity} | Prix unitaire: {ligne.price_unit.toFixed(2)} €
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(ligne.created_at).toLocaleDateString("fr-FR")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#1a1a1e] border-t border-gray-800 p-6 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    router.push(`/customize/${selectedCommande.id}`);
                                    setIsModalOpen(false);
                                }}
                                className="flex-grow px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 rounded-lg transition text-white"
                            >
                                Éditer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

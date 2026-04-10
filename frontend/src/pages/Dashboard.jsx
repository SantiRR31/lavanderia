import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [stats, setStats] = useState([
        { label: 'Pedidos hoy', value: 0, icon: 'list_alt', color: 'blue', growth: '+12%' },
        { label: 'Pendientes', value: 0, icon: 'pending_actions', color: 'amber', growth: 'Estable' },
        { label: 'Listos', value: 0, icon: 'check_circle', color: 'green', growth: '+5%' },
        { label: 'Entregados', value: 0, icon: 'local_shipping', color: 'slate', growth: '-2%' },
    ]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders', {
                params: {
                    page,
                    limit: 10,
                    status: filter
                }
            });
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
            setTotalRecords(response.data.total);
            setLoading(false);

            // Fetch all for stats (simplified for now to keep stats working)
            // In a real app, you'd have a separate /stats endpoint
            const resAll = await api.get('/orders', { params: { limit: 1000 } });
            const all = resAll.data.orders;
            setStats([
                { label: 'Pedidos hoy', value: all.filter(o => new Date(o.received_date).toDateString() === new Date().toDateString()).length, icon: 'list_alt', color: 'blue', growth: '+12%' },
                { label: 'Pendientes', value: all.filter(o => o.status === 'Recibido' || o.status === 'En proceso').length, icon: 'pending_actions', color: 'amber', growth: 'Estable' },
                { label: 'Listos', value: all.filter(o => o.status === 'Listo para recoger').length, icon: 'check_circle', color: 'green', growth: '+5%' },
                { label: 'Entregados', value: all.filter(o => o.status === 'Entregado').length, icon: 'local_shipping', color: 'slate', growth: '-2%' },
            ]);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, filter]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/orders/${id}`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error(error);
        }
    };

    // Remove local filtering as it's handled by API now
    const filteredOrders = orders;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Recibido': return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'En proceso': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'Listo para recoger': return 'bg-green-50 text-green-700 border border-green-100';
            case 'Entregado': return 'bg-slate-50 text-slate-400 border border-slate-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-black text-[#1B9B9A] uppercase tracking-tight">Resumen Operativo</h2>
                    <p className="text-slate-500 font-bold mt-1">Vista general de ordenes</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Día {new Date().toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                    <p className="text-lg font-black text-slate-900 uppercase">
                        {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Metrics Grid - White boards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => {
                    const colorStyles = {
                        blue: 'bg-blue-50 text-blue-600',
                        amber: 'bg-amber-50 text-amber-600',
                        green: 'bg-green-50 text-green-600',
                        slate: 'bg-slate-50 text-slate-600'
                    };
                    return (
                        <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${colorStyles[stat.color]} shadow-inner`}>
                                    <span className="material-symbols-outlined text-3xl font-bold">{stat.icon}</span>
                                </div>
                                <span className={`text-[11px] font-black px-3 py-1.5 rounded-full ${stat.growth.startsWith('+') ? 'text-green-600 bg-green-50 ring-1 ring-green-100' :
                                    stat.growth === 'Estable' ? 'text-slate-400 bg-slate-50 ring-1 ring-slate-100' : 'text-red-500 bg-red-50 ring-1 ring-red-100'
                                    }`}>{stat.growth}</span>
                            </div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Table Section - Clean White */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['Todos', 'Pendientes', 'Listos', 'Entregados'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setFilter(tab);
                                    setPage(1);
                                }}
                                className={`px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === tab
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 active:scale-95'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-3 px-6 py-3 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-xl">tune</span>
                        Filtros Avanzados
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Ticket ID</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Cliente</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Estado</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Fecha Creación</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Fecha Entrega</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Acciones</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#ec5b13] mb-4" />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Sincronizando base de datos...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="font-black text-slate-900 text-lg font-mono tracking-tighter flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                            {order.ticket_number}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black shadow-inner border border-white">
                                                {order.customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{order.customer.name}</span>
                                                <span className="text-[10px] text-slate-400 font-black tracking-tight">{order.customer.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-black tracking-tighter">
                                        {new Date(order.received_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-black tracking-tighter">
                                        {new Date(order.estimated_delivery).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <select
                                                className="bg-slate-50 border-2 border-transparent rounded-xl text-[10px] font-black uppercase px-3 py-2 focus:border-orange-200 focus:bg-white outline-none cursor-pointer transition-all"
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                            >
                                                <option value="Recibido">Recibido</option>
                                                <option value="En proceso">En Lavado</option>
                                                <option value="En proceso">En Secado</option>
                                                <option value="En proceso">En Planchado</option>
                                                <option value="Listo para recoger">Listo para recoger</option>
                                                <option value="Entregado">Entregado</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <span className="text-sm font-black text-slate-900">
                                            ${parseFloat(order.price).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Página {page} de {totalPages} • {totalRecords} Resultados
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-all active:scale-95 shadow-sm"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-orange-300 hover:text-[#ec5b13] transition-all active:scale-95 shadow-md shadow-slate-200/50 disabled:opacity-20"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, Search, Users, Star, TrendingUp, MessageCircle, History } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const stats = [
        { label: 'Total Clientes', value: customers.length, icon: Users, color: 'blue' },
        { label: 'Clientes Frecuentes', value: customers.filter(c => c.orderCount > 3).length, icon: Star, color: 'amber' },
        { label: 'Ingreso Promedio', value: `$${(customers.reduce((acc, curr) => acc + parseFloat(curr.totalSpend), 0) / (customers.length || 1)).toFixed(0)}`, icon: TrendingUp, color: 'green' },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin visitas';
        return new Date(dateString).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Base de Clientes</h2>
                    <p className="text-slate-500 font-bold mt-1">Gestión y análisis de fidelidad de clientes.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50 group">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${
                                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                'bg-green-50 text-green-600'
                            } shadow-inner`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-sm transition-all font-bold placeholder:text-slate-300 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20">
                        <Users size={18} />
                        Exportar Base
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Cliente</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Pedidos</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Invertido</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Última Visita</th>
                                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#ec5b13] mb-4" />
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Cargando clientes...</p>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No se encontraron clientes</p>
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black shadow-inner border border-white">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{customer.name}</span>
                                                <span className="text-[10px] text-slate-400 font-black tracking-tight">{customer.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                                            {customer.orderCount} Pedidos
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-sm font-black text-slate-900">
                                            ${customer.totalSpend}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-black tracking-tighter">
                                        {formatDate(customer.lastVisit)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                title="WhatsApp"
                                                className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all shadow-sm active:scale-90 border border-green-100"
                                                onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g,'')}`, '_blank')}
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                            <button 
                                                title="Historial"
                                                className="p-3 bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-[#ec5b13] rounded-xl transition-all shadow-sm active:scale-90 border border-slate-100"
                                            >
                                                <History size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;

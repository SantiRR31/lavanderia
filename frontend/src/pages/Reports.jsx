import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Loader2, TrendingUp, PackageOpen, CircleDollarSign, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import api from '../api';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
    Title, Tooltip, Legend, Filler
);

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/summary');
                setData(res.data);
            } catch (error) {
                console.error(error);
                setError('No se pudieron cargar los reportes. Verifica tu conexión o intenta recargar la página.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <Loader2 className="animate-spin w-12 h-12 text-[#ec5b13]" />
                    <span className="font-bold text-sm tracking-widest uppercase">Cargando métricas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-red-500 space-y-4">
                <AlertCircle size={48} />
                <p className="font-bold text-xl text-slate-800">Ups, algo salió mal</p>
                <p className="text-sm font-medium">{error}</p>
            </div>
        )
    }

    if (!data) return null;

    // Charts Config
    const revenueChartData = {
        labels: data.revenueByDate.map(d => d.date),
        datasets: [{
            label: 'Ingresos ($)',
            data: data.revenueByDate.map(d => d.amount),
            backgroundColor: 'rgba(27, 155, 154, 0.15)', // #1b9b9a with opacity
            borderColor: '#1b9b9a',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1b9b9a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const serviceChartData = {
        labels: data.serviceDistribution.map(s => s.name),
        datasets: [{
            data: data.serviceDistribution.map(s => s.value),
            backgroundColor: [
                '#1B9B9A', // principal
                '#2FAFAE',
                '#4FC3C2',
                '#6EC6C5',
                '#AEE3E2'
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1B9B9A] tracking-tight">Reportes y Analíticas</h1>
                    <p className="text-slate-500 font-medium mt-1">Desempeño de la lavandería.</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] text-green-600 flex items-center justify-center shrink-0">
                        <CircleDollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
                        <h4 className="text-2xl font-black text-slate-800">${parseFloat(data.kpis.totalIncome).toFixed(2)}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] text-[#ec5b13] flex items-center justify-center shrink-0">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Totales</p>
                        <h4 className="text-2xl font-black text-slate-800">{data.kpis.totalOrders}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] text-blue-600 flex items-center justify-center shrink-0">
                        <PackageOpen size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Prendas Procesadas</p>
                        <h4 className="text-2xl font-black text-slate-800">{data.kpis.totalGarments}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f4f8] text-purple-600 flex items-center justify-center shrink-0">
                        <CheckSquare size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Activos</p>
                        <h4 className="text-2xl font-black text-slate-800">{data.kpis.activeOrders}</h4>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Ingresos Recientes</h3>
                    <div className="h-[300px]">
                        <Line
                            data={revenueChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        grid: { color: '#f1f5f9', drawBorder: false },
                                        ticks: { callback: (value) => '$' + value, font: { family: 'Arial', weight: 'bold' }, color: '#94a3b8' }
                                    },
                                    x: {
                                        grid: { display: false, drawBorder: false },
                                        ticks: { font: { family: 'Arial', weight: 'bold' }, color: '#94a3b8' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6">Servicios Más Populares</h3>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="h-[250px] w-full">
                            <Pie
                                data={serviceChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { font: { family: 'Arial', weight: 'bold' }, padding: 20, usePointStyle: true } }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10 items-start">

                {/* Columna 1: Top Clientes y Próximos */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Top Customers */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#f0f4f8] text-[#ec5b13] flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm">star</span>
                            </div>
                            <h3 className="font-black text-slate-800">Mejores clientes</h3>
                        </div>
                        <div className="p-4">
                            {data.topCustomers.length === 0 ? (
                                <p className="text-center text-slate-400 py-6 text-sm font-medium">Aún no hay suficientes datos.</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.topCustomers.map((customer, index) => (
                                        <div key={customer.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#f0f4f8] hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-md">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{customer.name}</p>
                                                    <p className="text-xs font-bold text-slate-400">{customer.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-green-600">${customer.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ontime orders */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#f0f4f8] text-green-500 flex items-center justify-center">
                                <Clock size={16} strokeWidth={3} />
                            </div>
                            <h3 className="font-black text-slate-800">Proximos</h3>
                        </div>
                        <div className="p-4">
                            {data.upcomingOrders?.length === 0 ? (
                                <p className="text-center text-slate-400 py-6 text-sm font-medium">No hay pedidos próximos.</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.upcomingOrders?.map((order) => {
                                        const deliveryDate = new Date(order.estimated_delivery);
                                        return (
                                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-50/50 hover:bg-green-50 transition-colors gap-3">
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                                                        {order.ticket_number}
                                                        <span className="bg-green-100 text-green-600 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                                                            A tiempo
                                                        </span>
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">Cliente: {order.customer.name}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Entrega para el:</p>
                                                    <p className="font-black text-green-600 text-sm">{deliveryDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna 2: Atrasados */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Overdue Orders */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#f0f4f8] text-red-500 flex items-center justify-center">
                                <Clock size={16} strokeWidth={3} />
                            </div>
                            <h3 className="font-black text-slate-800">Atrasados</h3>
                        </div>
                        <div className="p-4">
                            {data.overdueOrders.length === 0 ? (
                                <p className="text-center text-slate-400 py-6 text-sm font-medium">¡Excelente! Todo está entregado a tiempo. ✨</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.overdueOrders.map((order) => {
                                        const deliveryDate = new Date(order.estimated_delivery);
                                        return (
                                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-50/50 hover:bg-red-50 transition-colors gap-3">
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                                                        {order.ticket_number}
                                                        <span className="bg-red-100 text-red-600 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                                                            Atrasado
                                                        </span>
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-500 mt-1">Cliente: {order.customer.name}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Debió entregarse el</p>
                                                    <p className="font-black text-red-500 text-sm">{deliveryDate.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

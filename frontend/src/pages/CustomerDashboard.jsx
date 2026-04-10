import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';

// REEMPLAZA ESTA URL CON TU WEBHOOK DE n8n
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/chatbot';

const CustomerDashboard = () => {
    const { ticketNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Carousel State
    const [announcements, setAnnouncements] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch announcements
    useEffect(() => {
        const fetchAnnReq = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/announcements');
                setAnnouncements(res.data);
            } catch (err) {
                console.error('Error fetching announcements', err);
            }
        };
        fetchAnnReq();
    }, []);

    // Autoplay logic
    useEffect(() => {
        if (announcements.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setCurrentSlide(s => (s === announcements.length - 1 ? 0 : s + 1));
        }, 4000);
        return () => clearInterval(interval);
    }, [announcements.length, isPaused]);

    const nextSlide = () => setCurrentSlide(s => (s === announcements.length - 1 ? 0 : s + 1));
    const prevSlide = () => setCurrentSlide(s => (s === 0 ? announcements.length - 1 : s - 1));

    // Chat state
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! Soy el asistente virtual de la lavandería. 😊 ¿En qué puedo ayudarte?', date: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { sender: 'user', text: inputValue, date: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Creamos el historial actualizado incluyendo el mensaje actual para evitar el desfase
            const updatedHistory = [...messages, userMsg].slice(-7);

            const response = await axios.post(N8N_WEBHOOK_URL, {
                message: inputValue,
                history: updatedHistory,
                ticketNumber: order.ticket_number,
                customerName: order.customer.name,
                status: order.status,
                price: order.price,
                deliveryDate: new Date(order.estimated_delivery).toLocaleDateString(),
                service: order.service_type,
                garments: order.garments_count
            });

            const botMsg = {
                sender: 'bot',
                text: response.data.output || 'Lo siento, tuve un problema al procesar tu mensaje.',
                date: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Error con n8n:', err);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: 'Diculpa, mi conexión con el servidor de inteligencia se ha interrumpido. Por favor intenta más tarde.',
                date: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${ticketNumber}`);
            setOrder(response.data);
            setLoading(false);
        } catch (err) {
            setError('No pudimos encontrar los detalles del pedido.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [ticketNumber]);

    const getStatusInfo = (status) => {
        const stages = [
            { id: 'Recibido', label: 'Recibido', icon: 'check', progress: 20 },
            { id: 'En proceso', label: 'Lavado', icon: 'waves', progress: 40 },
            { id: 'Listo para recoger', label: 'Listo', icon: 'inventory_2', progress: 80 },
            { id: 'Entregado', label: 'Entregado', icon: 'task_alt', progress: 100 },
        ];

        const currentIndex = stages.findIndex(s => s.id === status);
        const currentStage = stages[currentIndex] || stages[0];

        return {
            stages,
            currentIndex,
            currentStage,
            progress: currentStage.progress
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#ec5b13]" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center font-display">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h2 className="text-2xl font-bold mb-2">¡Ups! Algo salió mal</h2>
                <p className="text-slate-600 mb-6 font-medium">{error || 'Pedido no encontrado'}</p>
                <button
                    onClick={() => navigate('/tracking')}
                    className="bg-[#ec5b13] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-transform active:scale-95"
                >
                    Volver a buscar
                </button>
            </div>
        );
    }

    const { stages, currentIndex, currentStage, progress } = getStatusInfo(order.status);




    return (
        <div className="bg-[#f3f4f6] font-display text-slate-900 antialiased min-h-screen pb-20 relative">
            <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">

                {/* Header - Fixed colors for high visibility */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1B9B9A] rounded-xl p-3 shadow-lg shadow-[#6EC6C5]/40 hover:bg-[#16807F] transition-all duration-200">
                            <span className="material-symbols-outlined text-white text-3xl">
                                local_laundry_service
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Seguimiento de tu pedido</h1>
                            <p className="text-slate-500 mt-1 font-semibold text-base">Consulta el estado actual de tu ropa en proceso</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-2.5 bg-[#AEE3E2] border border-[#6EC6C5] rounded-2xl text-[#1B9B9A] font-black text-sm tracking-wide shadow-md hover:bg-[#6EC6C5] hover:text-white transition-all duration-200">
                            Ticket: <span className="uppercase">{order.ticket_number}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Status & Timeline */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Main Status Card - Solid White background */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-500">
                            <div className="p-8 md:p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#E8F8F8] flex items-center justify-center text-[#1B9B9A] border border-[#AEE3E2] shadow-sm hover:bg-[#AEE3E2] transition-all duration-200">
                                            <span className="material-symbols-outlined text-3xl">
                                                {currentStage.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Estado Actual</p>
                                            <h3 className="text-3xl font-black text-[#1B9B9A] leading-none">{order.status}</h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progreso</p>
                                        <p className="text-3xl font-black text-slate-900">{progress}%</p>
                                    </div>
                                </div>

                                {/* Progress Bar Stages */}
                                <div className="relative py-6">
                                    <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="relative flex justify-between">
                                        {stages.map((stage, idx) => {
                                            const isCompleted = idx < currentIndex;
                                            const isCurrent = idx === currentIndex;

                                            return (
                                                <div key={stage.id} className="flex flex-col items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-8 ring-white z-10 transition-all duration-700 ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-200' :
                                                        isCurrent ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110' :
                                                            'bg-gray-200 text-gray-400'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-base font-bold">
                                                            {isCompleted ? 'check' : stage.icon}
                                                        </span>
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tighter ${isCompleted ? 'text-slate-900' :
                                                        isCurrent ? 'text-blue-600 underline underline-offset-4' :
                                                            'text-slate-400'
                                                        }`}>
                                                        {stage.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-12 p-6 bg-[#F4FBFB] rounded-2xl border border-[#AEE3E2] flex items-center gap-4">
                                    <span className="material-symbols-outlined text-[#1B9B9A] text-2xl">info</span>
                                    <p className="text-[#1B9B9A] font-bold text-sm leading-relaxed">
                                        {order.status === 'Recibido' && 'Hemos recibido tu pedido correctamente en nuestra sucursal.'}
                                        {order.status === 'En proceso' && 'Tu pedido se encuentra actualmente en proceso de lavado y cuidado.'}
                                        {order.status === 'Listo para recoger' && '¡Tu ropa está lista! Puedes pasar a recogerla en cualquier momento.'}
                                        {order.status === 'Entregado' && 'Este pedido ya ha sido entregado. ¡Gracias por confiar en nosotros!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">history</span>
                                Historial del proceso
                            </h3>
                            <div className="space-y-10 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-1 before:bg-gray-100">
                                <div className="relative flex items-center gap-8 pl-2">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 z-10 border-4 border-white shadow-sm">
                                        <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg">Recibido en sucursal</h4>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-70">
                                            {new Date(order.received_date).toLocaleDateString()} • {new Date(order.received_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className={`relative flex items-center gap-8 pl-2 ${currentIndex < 1 ? 'opacity-30' : ''}`}>
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full z-10 border-4 border-white shadow-sm ${currentIndex >= 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {currentIndex > 1 ? (
                                            <span className="material-symbols-outlined text-2xl font-bold text-green-600">check_circle</span>
                                        ) : (
                                            <div className={`w-4 h-4 rounded-full ${currentIndex === 1 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-lg ${currentIndex === 1 ? 'text-blue-600' : 'text-slate-600'}`}>En curso / Lavado</h4>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{currentIndex > 1 ? 'Completado' : currentIndex === 1 ? 'En progreso...' : 'Pendiente'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Details */}
                    <div className="space-y-8">

                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 font-display">Resumen del Pedido</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'Ticket', value: order.ticket_number, highlight: false },
                                    { label: 'Estado', value: order.status, highlight: true },
                                    { label: 'Recepción', value: new Date(order.received_date).toLocaleDateString(), highlight: false },
                                    { label: 'Entrega Estimada', value: new Date(order.estimated_delivery).toLocaleDateString(), highlight: true, color: 'text-[#1B9B9A]' },
                                ].map((item, id) => (
                                    <div key={id} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 pb-3 text-sm">
                                        <span className="text-slate-400 font-black uppercase tracking-wider">{item.label}</span>
                                        <span className={`font-black ${item.highlight ? (item.color || 'text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg') : 'text-slate-900'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Articles Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined">receipt_long</span>
                                    Detalle del Servicio
                                </h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                            <span className="material-symbols-outlined text-2xl">checkroom</span>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 capitalize text-lg text-sm">{order.service_type}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Total Prendas</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-black text-slate-800">x{order.garments_count}</span>
                                </div>

                                <div className="pt-8 mt-8 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-lg font-black text-slate-400 uppercase tracking-widest text-sm">Pagado</span>
                                    <span className="text-4xl font-black text-[#1B9B9A]">${order.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Back to search */}
                        <button
                            onClick={() => navigate('/tracking')}
                            className="w-full h-16 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-3xl font-black text-slate-600 hover:bg-[#6EC6C5] hover:text-white transition-all duration-300 shadow-shadow-[0_4px_15px_rgba(27,155,154,0.6)] active:scale-95 group text-sm"
                        >
                            <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-45">search</span>
                            Consultar otra orden
                        </button>
                    </div>
                </div>

                {/* Promotional Carousel */}
                {announcements.length > 0 && (
                    <div
                        className="mt-16 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-[#1B9B9A]/10 border-4 border-white overflow-hidden relative group"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Carousel Wrapper */}
                        <div className="relative h-64 sm:h-80 md:h-[400px] w-full overflow-hidden">
                            {announcements.map((ann, idx) => (
                                <div
                                    key={ann.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 text-transparent z-10"></div>
                                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 transform transition-all duration-700 translate-y-0">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-[#1B9B9A] text-white text-[10px] uppercase font-black tracking-widest rounded-lg flex items-center gap-1 shadow-md shadow-[#1B9B9A]/30">
                                                <span className="material-symbols-outlined text-[10px]">campaign</span> AVISO
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">{ann.title}</h2>
                                        {ann.description && (
                                            <p className="text-white/80 font-medium text-sm md:text-base max-w-2xl leading-relaxed">{ann.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        {announcements.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95 border border-white/10 shadow-xl"
                                >
                                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95 border border-white/10 shadow-xl"
                                >
                                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                                </button>

                                {/* Dots */}
                                <div className="absolute bottom-10 right-10 z-30 flex gap-2 p-3 bg-slate-900/40 backdrop-blur-md rounded-2xl">
                                    {announcements.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`h-2.5 rounded-full transition-all duration-500 hover:bg-[#1B9B9A] ${idx === currentSlide ? 'bg-[#1B9B9A] w-10 shadow-[0_4px_15px_rgba(27,155,154,0.6)]' : 'bg-white/40 w-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.2)]'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <footer className="mt-20 text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} Laundry Soft Dashboard
                    </p>
                    <p className="text-slate-400 text-xs mt-2">
                        ¿Necesitas ayuda? <a className="text-[#6EC6C5] hover:underline font-bold" href="#">Contacta con soporte</a>
                    </p>
                </footer>
            </div>

            {/* Chatbot Support Bubble */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out ${isChatOpen ? 'translate-y-0 scale-100' : 'translate-y-0'}`}>
                {/* Chat Window */}
                <div className={`absolute bottom-20 right-0 w-80 sm:w-96 bg-[#F4FBFB] rounded-[2rem] shadow-2xl shadow-[#6EC6C5]/20 border border-[#AEE3E2] overflow-hidden transition-all duration-500 transform origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}>
                    {/* Chat Header */}
                    <div className="bg-[#1B9B9A] p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#6EC6C5] flex items-center justify-center backdrop-blur-sm">
                                <span className="material-symbols-outlined text-white">smart_toy</span>
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-wider leading-none">Chat de ayuda</h4>
                                <p className="text-[10px] text-white/70 font-bold mt-1 uppercase tracking-widest">Soporte Virtual</p>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Messages Placeholder */}
                    <div className="h-[400px] p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'bot' ? 'bg-[#1B9B9A] text-white' : 'bg-white text-[#1B9B9A] border border-[#1B9B9A]'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {msg.sender === 'bot' ? 'smart_toy' : 'person'}
                                    </span>
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm border ${msg.sender === 'bot'
                                    ? 'bg-white rounded-tl-none border-slate-100'
                                    : 'bg-[#1B9B9A] text-white rounded-tr-none border-[#1B9B9A]'
                                    } max-w-[80%]`}>
                                    <p className={`text-xs font-bold leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-slate-700'}`}>
                                        {msg.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-[#1B9B9A] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm">more_horiz</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Escribiendo...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Placeholder */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-white border border-[#AEE3E2] rounded-xl text-xs font-semibold text-[#1B9B9A] px-4 py-3 outline-none placeholder:text-[#6EC6C5] focus:ring-2 focus:ring-[#6EC6C5]/40 focus:border-[#6EC6C5] transition-all duration-200 font-display"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isTyping}
                            className="bg-[#1B9B9A] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#6EC6C5]/40 hover:bg-[#16807F] active:scale-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send size={18} />
                        </button>
                    </form>
                </div>

                {/* Floating Bubble Button */}
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`w-16 h-16 rounded-full bg-[#1B9B9A] text-white shadow-2xl shadow-[#1B9B9A]/40 flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 relative group ${isChatOpen ? 'rotate-[360deg]' : ''}`}
                >
                    <span className="material-symbols-outlined text-3xl font-bold">
                        {isChatOpen ? 'close_fullscreen' : 'smart_toy'}
                    </span>
                    {!isChatOpen && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CustomerDashboard;

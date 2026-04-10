import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerSearch = () => {
    const [ticket, setTicket] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Modified to string to hold error msgs
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        const value = ticket.trim();

        if (!value) {
            setError('Por favor ingresa un número de ticket');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Pequeño delay para la animación
            setTimeout(async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/orders/${value.toUpperCase()}`);
                    if (response.data) {
                        navigate(`/order/${value.toUpperCase()}`);
                    }
                } catch (err) {
                    setError('El ticket no existe. Verifica tu información.');
                    setLoading(false);
                }
            }, 1000);
        } catch (err) {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-slate-50 font-display">
            <style>{`
                @keyframes liquid-bubble {
                    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg); }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg); }
                }
                .animate-liquid { animation: liquid-bubble 2s linear infinite; }

                @keyframes floatUp {
                    0% { transform: translateY(0vh) scale(0.5) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(-120vh) scale(1.5) rotate(360deg); opacity: 0; }
                }
                .bubble {
                    position: absolute;
                    bottom: -10vh;
                    background: radial-gradient(circle at 30% 30%, rgba(27, 155, 154, 0.2), rgba(27, 155, 154, 0.05) 70%);
                    border: 1px solid rgba(27, 155, 154, 0.4);
                    border-radius: 50%;
                    animation: floatUp 15s infinite ease-in;
                    pointer-events: none;
                    backdrop-filter: blur(4px);
                    box-shadow: inset -5px -5px 15px rgba(255,255,255,0.5), inset 5px 5px 15px rgba(255,255,255,0.8);
                }
            `}</style>

            {/* FONDO INTENSO CON BURBUJAS */}
            <div className="absolute inset-0 -z-10 bg-slate-50 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-[#1B9B9A]/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-[35rem] h-[35rem] bg-[#94273E]/20 rounded-full blur-[100px]"></div>

                {/* Burbujas flotantes */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="bubble"
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 40 + 20}px`,
                            height: `${Math.random() * 40 + 20}px`,
                            animationDuration: `${Math.random() * 15 + 15}s`,
                            animationDelay: `-${Math.random() * 30}s`,
                        }}
                    ></div>
                ))}
            </div>

            <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-2xl animate-in zoom-in-95 duration-500 fade-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-[2rem] shadow-xl mb-6 text-3xl">🫧</div>
                    <h2 className="text-3xl font-black text-[#1B9B9A] tracking-tight">Rastrea tu pedido</h2>
                    <p className="text-slate-500 font-medium text-sm mt-3">Ingresa el codigo localizado dentro del ticket que recibiste en sucursal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl text-sm font-bold text-center shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSearch} className="space-y-6">
                    <input
                        required
                        type="text"
                        className="w-full px-6 py-4 bg-white/80 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-[#1B9B9A] font-bold text-slate-700 uppercase focus:ring-4 focus:ring-[#1B9B9A]/10 transition-all"
                        placeholder="Codigo (ej. T-123456-AA-BB)"
                        value={ticket}
                        onChange={(e) => {
                            setTicket(e.target.value);
                            if (error) setError('');
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`relative w-full h-16 flex items-center justify-center rounded-[2rem] font-black tracking-wider text-base uppercase shadow-xl transition-all duration-500 disabled:opacity-90 disabled:cursor-wait
                            ${loading ? 'bg-[#1B9B9A]' : 'bg-slate-900 hover:bg-[#1B9B9A] hover:-translate-y-1 text-white hover:shadow-[#1B9B9A]/30'}`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent animate-liquid"></div>
                                <span className="text-xs uppercase tracking-[0.2em] text-white">Buscando...</span>
                            </div>
                        ) : (
                            "Consultar Estatus"
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-slate-200/50 text-center">
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                        ¿Problemas con tu ticket?<br />
                        <a className="text-[#1B9B9A] hover:text-[#158080] font-black underline underline-offset-4 mt-2 inline-block transition-colors" href="#">
                            Soporte en línea
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerSearch;

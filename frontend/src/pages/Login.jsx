import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            navigate('/admin');
        } catch (err) {
            setError('Credenciales incorrectas. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex selection:bg-primary-100 selection:text-primary-700">
            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-1/3 bg-[#475569] p-20 flex-col justify-between text-white relative h-screen">
                <div className="z-10">
                    <h1 className="text-4xl font-extrabold mb-4">Hola</h1>
                    <p className="text-primary-100 font-medium">Gestión inteligente para ordenes</p>
                </div>
                <div className="z-10 flex flex-col gap-6">
                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
                        <p className="text-sm font-bold opacity-70 mb-2 italic">Sugerencia</p>
                        <p className="text-sm">Recuerde cerrar la sesión al finalizar el turno para mantener la seguridad de los datos de los clientes.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <ShieldAlert size={400} />
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-2/3 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-12 animate-in fade-in slide-in-from-right-16 duration-700">
                    <div className="space-y-4">
                        <h2 className="uppercase text-4xl font-black text-slate-900 tracking-tight">Acceso de administrador</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Bienvenido de nuevo. Introduzca sus credenciales para gestionar el sistema de lavandería.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-extrabold text-slate-500 group-focus-within:text-[#1B9B9A] transition-colors uppercase tracking-widest mb-3">Usuario</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Escriba su usuario"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#1B9B9A]/20 focus:border-[#1B9B9A] focus:shadow-[0_0_15px_rgba(27,155,154,0.15)] bg-white transition-all text-slate-700 font-bold placeholder:font-medium"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-extrabold text-slate-500 group-focus-within:text-[#1B9B9A] transition-colors uppercase tracking-widest mb-3">Contraseña</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:outline-none focus:ring-4 focus:ring-[#1B9B9A]/20 focus:border-[#1B9B9A] focus:shadow-[0_0_15px_rgba(27,155,154,0.15)] bg-white transition-all text-slate-700 font-bold placeholder:font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-in zoom-in duration-300">
                                <ShieldAlert size={20} className="shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1B9B9A] hover:bg-[#1B9B9A]/80 text-white font-black py-5 px-8 rounded-3xl shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar al Panel
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-slate-100 flex items-center gap-4 text-slate-400">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <Lock size={16} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider italic">Sistema de Seguridad de Lavandería Encriptado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

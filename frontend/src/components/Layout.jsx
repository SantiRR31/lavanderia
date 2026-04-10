import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { name: 'Nuevo pedido', path: '/admin/new-order', icon: 'add_circle' },
        { name: 'Clientes', path: '/admin/customers', icon: 'group' },
        { name: 'Reportes', path: '/admin/reports', icon: 'bar_chart' },
        { name: 'Configuración', path: '/admin/settings', icon: 'settings' },
    ];

    return (
        <div className="bg-[#f3f4f6] text-slate-900 min-h-screen flex w-full font-display">
            {/* Sidebar - Solid White */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-[#1B9B9A] rounded-lg p-2.5 flex items-center justify-center text-white shadow-lg shadow-[#1B9B9A]/20">
                        <span className="material-symbols-outlined font-bold">local_laundry_service</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 text-lg font-black leading-none uppercase tracking-tight">Lavandería</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Panel del administrador</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${isActive
                                    ? 'bg-[#1B9B9A] text-white font-black shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 font-bold'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-xl ${isActive ? 'fill-1' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 px-2 py-3 mb-2">
                        <div className="size-10 rounded-full bg-[#1B9B9A] flex items-center justify-center text-white font-black border-2 border-white shadow-sm overflow-hidden">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-black text-slate-900 truncate">
                                {localStorage.getItem('username') || 'Admin User'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase truncate tracking-tighter">Administrador</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content Container */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen bg-[#f3f4f6]">
                {/* Header - Solid White */}


                {/* Page Outlet */}
                <main className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                <footer className="mt-auto p-10 text-center text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] border-t border-slate-100 bg-white">
                    © {new Date().getFullYear()} LavaPro System
                </footer>
            </div>
        </div>
    );
};

export default Layout;

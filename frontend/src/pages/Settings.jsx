import { useState, useEffect } from 'react';
import api from '../api';
import { Shield, Users, Trash2, Edit2, Plus, Search, Loader2, X, Save, ShieldAlert } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('admins');

    // Announcements state
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '', imageUrl: '', active: true });

    // Admin state
    const [admins, setAdmins] = useState([]);
    const [adminLoading, setAdminLoading] = useState(true);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
    const [adminError, setAdminError] = useState('');

    // Customer state
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState(null);

    const currentUser = localStorage.getItem('username');

    // Fetch Admin Data
    const fetchAdmins = async () => {
        setAdminLoading(true);
        try {
            const res = await api.get('/auth');
            setAdmins(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setAdminLoading(false);
        }
    };

    // Fetch Customer Data
    const fetchCustomers = async () => {
        setCustomerLoading(true);
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
            setFilteredCustomers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCustomerLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        setAnnouncementsLoading(true);
        try {
            const res = await api.get('/announcements/all');
            setAnnouncements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setAnnouncementsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'admins') fetchAdmins();
        if (activeTab === 'customers') fetchCustomers();
        if (activeTab === 'announcements') fetchAnnouncements();
    }, [activeTab]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const lowerSearch = searchTerm.toLowerCase();
            setFilteredCustomers(customers.filter(c =>
                c.name.toLowerCase().includes(lowerSearch) ||
                c.phone.includes(lowerSearch)
            ));
        }
    }, [searchTerm, customers]);

    // Announcements Handlers
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', newAnnouncement);
            setShowAnnouncementModal(false);
            setNewAnnouncement({ title: '', description: '', imageUrl: '', active: true });
            if (activeTab === 'announcements') fetchAnnouncements();
        } catch (error) {
            alert('Error al crear anuncio');
        }
    };

    const handleToggleAnnouncement = async (id) => {
        try {
            await api.patch(`/announcements/${id}/toggle`);
            if (activeTab === 'announcements') fetchAnnouncements();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este aviso?')) {
            try {
                await api.delete(`/announcements/${id}`);
                if (activeTab === 'announcements') fetchAnnouncements();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    // Admin Handlers
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setAdminError('');
        try {
            await api.post('/auth/register', newAdmin);
            setShowAdminModal(false);
            setNewAdmin({ username: '', password: '' });
            fetchAdmins();
        } catch (error) {
            setAdminError(error.response?.data?.error || 'Falló la creación del administrador');
        }
    };

    const handleDeleteAdmin = async (id, username) => {
        if (username === currentUser) {
            alert('No puedes eliminar tu propio usuario en sesión.');
            return;
        }
        if (window.confirm(`¿Estás seguro de eliminar al administrador ${username}?`)) {
            try {
                await api.delete(`/auth/${id}`);
                fetchAdmins();
            } catch (error) {
                alert('Hubo un error al eliminar al administrador.');
            }
        }
    };

    // Customer Handlers
    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/customers/${editingCustomer.id}`, {
                name: editingCustomer.name,
                phone: editingCustomer.phone
            });
            setEditingCustomer(null);
            fetchCustomers();
        } catch (error) {
            alert('Hubo un error al guardar el cliente.');
        }
    };

    const handleDeleteCustomer = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${name} y TODO su historial de pedidos? Esta acción no se puede deshacer.`)) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                alert('Hubo un error al eliminar al cliente.');
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1B9B9A] tracking-tight">Configuración del Sistema</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestión de accesos y base de datos de usuarios.</p>
                </div>
            </header>

            {/* Custom Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'admins'
                        ? 'text-[#16807F] border-b-2 border-[#16807F]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Shield size={16} /> Administradores
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'customers'
                        ? 'text-[#1B9B9A] border-b-2 border-[#1B9B9A]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={16} /> Clientes
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'announcements'
                        ? 'text-[#2FAFAE] border-b-2 border-[#2FAFAE]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">campaign</span> Avisos
                    </div>
                </button>
            </div>

            {/* Announcements Tab Content */}
            {activeTab === 'announcements' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-bold text-slate-800">Avisos Públicos</h2>
                        <button
                            onClick={() => setShowAnnouncementModal(true)}
                            className="bg-[#475569] hover:bg-[#1B9B9A] text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-slate-600/20 transition-all flex items-center gap-2 active:scale-95 text-sm"
                        >
                            <Plus size={18} /> Nuevo
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcementsLoading ? (
                            <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : announcements.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-3xl">No hay avisos registrados.</div>
                        ) : (
                            announcements.map(ann => (
                                <div key={ann.id} className={`bg-white rounded-3xl overflow-hidden border-2 transition-all ${ann.active ? 'border-[#1B9B9A]/30 shadow-lg shadow-[#1B9B9A]/10' : 'border-slate-100 opacity-60'}`}>
                                    <div className="h-40 bg-slate-100 relative overflow-hidden group">
                                        <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Valida'} />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button onClick={() => handleToggleAnnouncement(ann.id)} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md border ${ann.active ? 'bg-[#1B9B9A] text-white border-[#1B9B9A]' : 'bg-slate-900/80 text-white border-slate-700'}`}>
                                                {ann.active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-black text-slate-800 text-lg mb-2 truncate">{ann.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 min-h-[40px]">{ann.description || 'Sin descripción adicional.'}</p>
                                        <div className="flex justify-end pt-4 border-t border-slate-50">
                                            <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Admins Tab Content */}
            {activeTab === 'admins' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800">Cuentas de Acceso</h2>
                        <button
                            onClick={() => setShowAdminModal(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center gap-2 active:scale-95 text-sm"
                        >
                            <Plus size={18} /> Nuevo Admin
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        {adminLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">ID</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Usuario</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {admins.map(admin => (
                                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-500">#{admin.id}</td>
                                            <td className="px-8 py-5 text-sm font-black text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1B9B9A]/10 text-[#1B9B9A] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                </div>
                                                {admin.username}
                                                {admin.username === currentUser && (
                                                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-black tracking-widest rounded-md">Tú</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30"
                                                    disabled={admin.username === currentUser}
                                                    title={admin.username === currentUser ? "No puedes eliminarte a ti mismo" : "Eliminar administrador"}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Customers Tab Content */}
            {activeTab === 'customers' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Gestión de Clientes</h2>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-200 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        {customerLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Nombre</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Teléfono</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Pedidos</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredCustomers.map(customer => (
                                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5 text-sm font-black text-slate-800">{customer.name}</td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-500">{customer.phone}</td>
                                                <td className="px-8 py-5 text-sm font-bold text-slate-500">{customer.orderCount} historial</td>
                                                <td className="px-8 py-5 flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingCustomer(customer)}
                                                        className="p-2 text-[#1B9B9A] hover:text-[#16807F] hover:bg-[#1B9B9A]/10 rounded-xl transition-colors"
                                                        title="Editar cliente"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCustomers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">
                                                    No se encontraron clientes
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Creation Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                <Shield className="text-[#1B9B9A]" size={20} /> Nuevo Administrador
                            </h3>
                            <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="p-6 space-y-5">
                            {adminError && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex gap-3 text-sm font-bold">
                                    <ShieldAlert size={18} /> {adminError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Usuario</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={newAdmin.username}
                                    onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={newAdmin.password}
                                    onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-[#1B9B9A] text-white font-black rounded-2xl py-4 shadow-lg shadow-[#1B9B9A]/20 active:scale-95 transition-all">
                                Crear Cuenta
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#1B9B9A]/5">
                            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1B9B9A]">add_photo_alternate</span> Crear Aviso
                            </h3>
                            <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título del Aviso</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Promoción de Primavera"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={newAnnouncement.title}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descripción (Opcional)</label>
                                <textarea
                                    placeholder="Detalles del anuncio..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors min-h-[100px] resize-none"
                                    value={newAnnouncement.description}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URL de la Imagen</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://ejemplo.com/imagen.png"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={newAnnouncement.imageUrl}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, imageUrl: e.target.value })}
                                />
                                {newAnnouncement.imageUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden h-32 border-2 border-slate-100">
                                        <img src={newAnnouncement.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="w-full bg-[#1B9B9A] text-white font-black rounded-2xl py-4 shadow-lg shadow-[#1B9B9A]/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                                <Save size={18} /> Publicar Aviso
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Customer Edit Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#1B9B9A]/5">
                            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                <Edit2 className="text-[#1B9B9A]" size={20} /> Editar Cliente
                            </h3>
                            <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCustomer} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={editingCustomer.name}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                                            setEditingCustomer({ ...editingCustomer, name: val });
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="10 dígitos (Ej. 5512345678)"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#1B9B9A] focus:outline-none transition-colors"
                                    value={editingCustomer.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, ''); // Solo números
                                        if (val.length <= 10) {
                                            setEditingCustomer({ ...editingCustomer, phone: val });
                                        }
                                    }}
                                />
                                {editingCustomer.phone.length > 0 && editingCustomer.phone.length < 10 && (
                                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">El teléfono debe tener exactamente 10 dígitos.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={editingCustomer.name.trim().length < 3 || editingCustomer.phone.length !== 10}
                                className="w-full bg-[#1B9B9A] text-white font-black rounded-2xl py-4 shadow-lg shadow-[#1B9B9A]/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

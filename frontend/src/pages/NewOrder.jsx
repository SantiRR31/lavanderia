import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Download, LayoutDashboard, PlusCircle } from 'lucide-react';
import { jsPDF } from "jspdf";

const NewOrder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderRecord, setOrderRecord] = useState(null);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service_type: '',
        garments_count: 1,
        price: 0,
        estimated_delivery: ''
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        service_type: res.data[0].name,
                        price: (res.data[0].price * prev.garments_count).toFixed(2)
                    }));
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'name') {
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) return;
        }
        if (name === 'phone') {
            finalValue = value.replace(/\D/g, '');
            if (finalValue.length > 10) return;
        }

        let newFormData = { ...formData, [name]: finalValue };

        if (name === 'service_type' || name === 'garments_count') {
            const selectedService = services.find(s => s.name === (name === 'service_type' ? finalValue : formData.service_type));
            if (selectedService) {
                const count = name === 'garments_count' ? parseInt(finalValue) || 0 : formData.garments_count;
                newFormData.price = (parseFloat(selectedService.price) * count).toFixed(2);
            }
        }
        setFormData(newFormData);
    };

    const addLineWithDots = (doc, leftText, rightText, y) => {
        const pageWidth = 80; // ancho del ticket en mm
        const margin = 10;
        const maxWidth = pageWidth - margin * 2;

        const textWidthLeft = doc.getTextWidth(leftText);
        const textWidthRight = doc.getTextWidth(rightText);

        const dots = '.';
        let dotsLine = '';

        // Generar puntos hasta llenar el espacio
        while (doc.getTextWidth(dotsLine) < (maxWidth - textWidthLeft - textWidthRight)) {
            dotsLine += dots;
        }

        doc.text(leftText, margin, y);
        doc.text(dotsLine, margin + textWidthLeft, y);
        doc.text(rightText, pageWidth - margin, y, { align: "right" });
    };

    const generatePDF = () => {
        if (!orderRecord) return;

        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 150]
        });

        // 🎨 Colores
        const primary = [27, 155, 154]; // turquesa
        const dark = [40, 40, 40];

        // 🧾 HEADER
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...primary);
        doc.text("LAVANDERÍA", 40, 12, { align: "center" });

        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("Servicio profesional", 40, 17, { align: "center" });

        // Línea separadora
        doc.setDrawColor(...primary);
        doc.line(10, 20, 70, 20);

        // 🎟️ INFO TICKET
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...dark);
        doc.setFontSize(10);
        doc.text(`Ticket #${orderRecord.ticket_number}`, 40, 27, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 32);

        // 👤 CLIENTE
        doc.setFont("helvetica", "bold");
        doc.text("Cliente", 10, 40);

        doc.setFont("helvetica", "normal");
        doc.text(orderRecord.customer.name, 10, 45);
        doc.text(`Tel: ${orderRecord.customer.phone}`, 10, 50);

        // Línea suave
        doc.setDrawColor(220);
        doc.line(10, 55, 70, 55);

        // 🧺 SERVICIO
        doc.text("Servicio", 10, 62);

        doc.setFont("helvetica", "normal");

        addLineWithDots(
            doc,
            `${orderRecord.service_type} x${orderRecord.garments_count}`,
            `$${orderRecord.price}`,
            70
        );

        // 💰 TOTAL (DESTACADO)
        doc.setDrawColor(...primary);
        doc.line(10, 95, 70, 95);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...primary);
        doc.text(`$${orderRecord.price}`, 70, 105, { align: "right" });

        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("TOTAL", 10, 105);

        // 🙏 FOOTER
        doc.setDrawColor(220);
        doc.line(10, 115, 70, 115);

        // 📅 ENTREGA
        const entrega = new Date(orderRecord.estimated_delivery).toLocaleDateString();

        doc.setFont("helvetica", "bold");
        doc.text("Entrega", 10, 80, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.text(entrega, 10, 85, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Gracias por su preferencia", 40, 122, { align: "center" });
        doc.text("Conserve este ticket", 40, 127, { align: "center" });

        doc.save(`Ticket_${orderRecord.ticket_number}.pdf`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const customerRes = await api.post('/customers', {
                name: formData.name,
                phone: formData.phone,
                email: formData.email
            });

            const orderRes = await api.post('/orders', {
                customer_id: customerRes.data.id,
                service_type: formData.service_type,
                garments_count: parseInt(formData.garments_count),
                price: parseFloat(formData.price),
                estimated_delivery: formData.estimated_delivery
            });

            setOrderRecord(orderRes.data);
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert('Error creando el pedido: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getTodayDateString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 relative">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
                                <CheckCircle2 size={48} strokeWidth={2.5} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">¡Registro Exitoso!</h2>
                            <p className="text-slate-500 font-bold mt-2">El ticket <span className="text-[#1B9B9A] font-black">{orderRecord?.ticket_number}</span> ha sido generado correctamente.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={generatePDF}
                                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                            >
                                <Download size={20} />
                                Descargar Ticket PDF
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-wider text-xs border border-slate-100 hover:bg-slate-100 transition-all"
                                >
                                    <LayoutDashboard size={16} />
                                    Ir al Panel
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center justify-center gap-2 bg-[#1B9B9A] text-white py-4 rounded-2xl font-black uppercase tracking-wider text-xs border border-[#1B9B9A] hover:bg-[#1B9B9A]/80 transition-all"
                                >
                                    <PlusCircle size={16} />
                                    Nuevo Registro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-black text-[#1B9B9A] uppercase tracking-tight">Nuevo Pedido</h2>
                    <p className="text-slate-500 font-bold mt-1">Ingresa los datos para generar un nuevo ticket de servicio.</p>
                </div>
                <div className="bg-[#1B9B9A] p-4 rounded-2xl text-[#E8F8F8] shadow-sm border border-[#E8F8F8] hover:bg-[#E8F8F8] hover:text-[#1B9B9A] transition-all duration-1000 cursor-pointer">
                    <span className="material-symbols-outlined text-4xl font-bold">add_task</span>
                </div>
            </div>

            {/* Main Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>

                <div className="grid md:grid-cols-2 gap-16 relative">
                    <section className="space-y-10">
                        <h3 className="flex items-center gap-4 text-xl font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-50 pb-6">
                            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#1B9B9A]">person_add</span>
                            </span>
                            Datos del Cliente
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Nombre del Cliente</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors">person</span>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700 placeholder:text-slate-300"
                                        onChange={handleChange}
                                        value={formData.name}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Teléfono / WhatsApp</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors">phone_iphone</span>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        placeholder="10 dígitos (Ej: 5512345678)"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700 placeholder:text-slate-300"
                                        onChange={handleChange}
                                        value={formData.phone}
                                    />
                                    {formData.phone.length > 0 && formData.phone.length < 10 && (
                                        <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 absolute -bottom-5 left-0">El teléfono debe tener exactamente 10 dígitos.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Correo electrónico</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors">mail</span>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Ej: example@exam.com"
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700 placeholder:text-slate-300"
                                        onChange={handleChange}
                                        value={formData.email}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10">
                        <h3 className="flex items-center gap-4 text-xl font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-50 pb-6">
                            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#1B9B9A]">dry_cleaning</span>
                            </span>
                            Detalles del Pedido
                        </h3>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Tipo de prenda</label>
                                    <select
                                        name="service_type"
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700 cursor-pointer appearance-none"
                                        onChange={handleChange}
                                        value={formData.service_type}
                                    >
                                        {services.map(service => (
                                            <option key={service.id} value={service.name}>
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Cant. Prendas</label>
                                    <input
                                        name="garments_count"
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700"
                                        onChange={handleChange}
                                        value={formData.garments_count}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Precio Total</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-[#1B9B9A] transition-colors text-xl">$</span>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            required
                                            readOnly
                                            value={formData.price}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-6 py-5 bg-slate-100 border-2 border-transparent rounded-2xl outline-none font-black text-[#1B9B9A] text-2xl shadow-inner shadow-slate-100 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block pl-1">Entrega estimada</label>
                                    <input
                                        name="estimated_delivery"
                                        type="date"
                                        required
                                        min={getTodayDateString()}
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-[#e8f8f8] focus:bg-white transition-all outline-none font-black text-slate-700"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-600 transition-all flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Regresar
                    </button>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || formData.name.trim().length < 3 || formData.phone.length !== 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                            className="bg-[#6ec6c5] hover:bg-[#1B9B9A] text-white font-black uppercase tracking-[0.2em] py-5 px-14 rounded-2xl shadow-2xl shadow-slate-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="material-symbols-outlined font-bold">receipt_long</span>}
                            Generar Ticket de Pedido
                        </button>
                    </div>
                </div>
            </form>

            <div className="flex justify-center flex-col items-center gap-4 mt-8 opacity-30">
                <span className="material-symbols-outlined text-4xl text-slate-400">verified_user</span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Sistema Seguro de Gestión Profesional</p>
            </div>
        </div>
    );
};

export default NewOrder;

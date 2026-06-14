import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductTypes, getMaterials, getSuppliers, getProductById, updateProduct } from '../services/api';
import Loader from '../components/ui/Loader';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [productTypes, setProductTypes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({ typeId: '', materialId: '', supplierId: '', quantity: '' });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [types, mats, supps, product] = await Promise.all([
                    getProductTypes(), getMaterials(), getSuppliers(), getProductById(id)
                ]);

                const ext = (res) => Array.isArray(res) ? res : res?.data || res?.content || [];
                const tArr = ext(types), mArr = ext(mats), sArr = ext(supps);

                setProductTypes(tArr); setMaterials(mArr); setSuppliers(sArr);

                setForm({
                    typeId: tArr.find(t => t.name === product.type)?.id || '',
                    materialId: mArr.find(m => m.name === product.material)?.id || '',
                    supplierId: sArr.find(s => s.name === product.supplierName)?.id || '',
                    quantity: product.quantity || '',
                });
            } catch (err) {
                setError("Erreur de chargement.");
            } finally { setLoading(false); }
        };
        loadData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateProduct(id, {
                typeId: Number(form.typeId), materialId: Number(form.materialId),
                supplierId: Number(form.supplierId), quantity: Number(form.quantity),
            });
            navigate(`/products/${id}`);
        } catch (err) {
            setError(err?.response?.data?.message || 'Erreur lors de la modification.');
        } finally { setSubmitting(false); }
    };

    if (loading) return <Loader message="Chargement des informations..." />;

    return (
        <div className="container form-page-container">
            <header className="form-page__header animate-fade-in">
                <button className="btn-back" onClick={() => navigate(`/products/${id}`)}>← Retour</button>
                <h1 className="heading-1">Modifier le lot #{id}</h1>
            </header>

            {error && <div className="login-error" role="alert">⚠️ {error}</div>}

            <form className="form-card card animate-fade-in-up" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Type de produit</label>
                        <select className="form-select" value={form.typeId} onChange={e => setForm({ ...form, typeId: e.target.value })}>
                            <option value="">— Sélectionner —</option>
                            {productTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Matière première</label>
                        <select className="form-select" value={form.materialId} onChange={e => setForm({ ...form, materialId: e.target.value })}>
                            <option value="">— Sélectionner —</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Fournisseur</label>
                        <select className="form-select" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                            <option value="">— Sélectionner —</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Quantité (kg)</label>
                        <input type="number" step="0.01" className="form-input" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-back" onClick={() => navigate(`/products/${id}`)}>Annuler</button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Enregistrement...' : '✓ Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default EditProduct;
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { LayoutDashboard, ShoppingBag, Users, Plus, Edit, Trash2, X, PlusCircle, MinusCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [hasVariants, setHasVariants] = useState(false);
    const [variationGroups, setVariationGroups] = useState([]);

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                apiClient.get('/orders'),
                apiClient.get('/products')
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setName(product.name);
            setCategory(product.category);
            setPrice(product.price);
            setDescription(product.description);
            setImage(product.image);
            setHasVariants(product.hasVariants || false);
            setVariationGroups(product.variationGroups || []);
        } else {
            setEditingProduct(null);
            setName('');
            setCategory('');
            setPrice(0);
            setDescription('');
            setImage('');
            setHasVariants(false);
            setVariationGroups([]);
        }
        setIsProductModalOpen(true);
    };

    const closeModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleAddGroup = () => {
        setVariationGroups([...variationGroups, { name: '', type: 'single', required: false, options: [{ name: '', price: 0, prepTime: 0 }] }]);
    };

    const handleRemoveGroup = (gIndex) => {
        const newGroups = [...variationGroups];
        newGroups.splice(gIndex, 1);
        setVariationGroups(newGroups);
    };

    const handleGroupChange = (gIndex, field, value) => {
        const newGroups = [...variationGroups];
        newGroups[gIndex][field] = value;
        setVariationGroups(newGroups);
    };

    const handleAddOption = (gIndex) => {
        const newGroups = [...variationGroups];
        newGroups[gIndex].options.push({ name: '', price: 0, prepTime: 0 });
        setVariationGroups(newGroups);
    };

    const handleRemoveOption = (gIndex, oIndex) => {
        const newGroups = [...variationGroups];
        newGroups[gIndex].options.splice(oIndex, 1);
        setVariationGroups(newGroups);
    };

    const handleOptionChange = (gIndex, oIndex, field, value) => {
        const newGroups = [...variationGroups];
        newGroups[gIndex].options[oIndex][field] = value;
        setVariationGroups(newGroups);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        
        const payload = {
            name, category, price: Number(price), description, image, hasVariants, variationGroups
        };

        try {
            if (editingProduct) {
                await apiClient.put(`/products/${editingProduct._id}`, payload);
                toast.success('Product updated successfully');
            } else {
                await apiClient.post('/products', payload);
                toast.success('Product created successfully');
            }
            closeModal();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await apiClient.delete(`/products/${id}`);
                toast.success('Product deleted');
                fetchData();
            } catch (error) {
                toast.error('Error deleting product');
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-10 text-gold flex items-center gap-4">
                <LayoutDashboard className="w-10 h-10" /> Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                    <ShoppingBag className="w-12 h-12 text-gold mx-auto mb-4" />
                    <div className="text-3xl font-bold">{orders.length}</div>
                    <div className="text-gray-400">Total Orders</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                    <Plus className="w-12 h-12 text-crimson mx-auto mb-4" />
                    <div className="text-3xl font-bold">{products.length}</div>
                    <div className="text-gray-400">Menu Items</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                    <Users className="w-12 h-12 text-gold mx-auto mb-4" />
                    <div className="text-3xl font-bold">2</div>
                    <div className="text-gray-400">Total Users</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Orders Table */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-gold">Incoming Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-4">ID</th>
                                    <th className="py-4">Date</th>
                                    <th className="py-4">Total</th>
                                    <th className="py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-mono text-sm">{order._id.substring(0, 8)}...</td>
                                        <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 text-gold font-bold">Rs. {order.totalPrice.toFixed(2)}</td>
                                        <td className="py-4">
                                            <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs">{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gold">Menu Management</h2>
                        <button onClick={() => openModal()} className="bg-gold text-charcoal px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90">
                            <Plus className="w-5 h-5" /> Add New
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-charcoal">
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="py-4">Product</th>
                                    <th className="py-4">Category</th>
                                    <th className="py-4">Price</th>
                                    <th className="py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4">{product.name}</td>
                                        <td className="py-4">{product.category}</td>
                                        <td className="py-4 text-gold font-bold">Rs. {product.price.toFixed(2)}</td>
                                        <td className="py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal(product)} className="p-2 hover:text-gold transition-colors"><Edit className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 hover:text-crimson transition-colors"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-charcoal border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl my-8">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-charcoal z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Name *</label>
                                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Category *</label>
                                    <input required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Base Price (If no variations) *</label>
                                    <input type="number" required={!hasVariants} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Image URL *</label>
                                    <input required value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-gray-400">Description *</label>
                                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-gold min-h-[80px]" />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="w-5 h-5 accent-gold" />
                                    <span className="text-lg font-bold text-white">Enable Variations</span>
                                </label>

                                {hasVariants && (
                                    <div className="space-y-6 mt-4 p-4 border border-white/10 rounded-xl bg-white/5">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gold">Variation Groups</h3>
                                            <button type="button" onClick={handleAddGroup} className="bg-white/10 hover:bg-gold/20 text-white hover:text-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                                <PlusCircle className="w-4 h-4" /> Add Group
                                            </button>
                                        </div>

                                        {variationGroups.map((group, gIndex) => (
                                            <div key={gIndex} className="p-4 border border-white/10 rounded-lg bg-charcoal space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-xs text-gray-400 mb-1 block">Group Name</label>
                                                            <input required value={group.name} onChange={(e) => handleGroupChange(gIndex, 'name', e.target.value)} placeholder="e.g. Size, Volume" className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-gold outline-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-400 mb-1 block">Type</label>
                                                            <select value={group.type} onChange={(e) => handleGroupChange(gIndex, 'type', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-gold outline-none">
                                                                <option value="single">Single (Radio)</option>
                                                                <option value="multi">Multi (Checkbox)</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center h-full pt-5">
                                                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                                                <input type="checkbox" checked={group.required} onChange={(e) => handleGroupChange(gIndex, 'required', e.target.checked)} className="accent-gold" />
                                                                Required
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveGroup(gIndex)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors mt-5">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="pl-4 border-l-2 border-white/10 space-y-2">
                                                    <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Options</h4>
                                                    {group.options.map((option, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3">
                                                            <input required value={option.name} onChange={(e) => handleOptionChange(gIndex, oIndex, 'name', e.target.value)} placeholder="Option Name" className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-gold outline-none" />
                                                            <input type="number" required value={option.price} onChange={(e) => handleOptionChange(gIndex, oIndex, 'price', Number(e.target.value))} placeholder="Price" className="w-24 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-gold outline-none" />
                                                            <input type="number" value={option.prepTime} onChange={(e) => handleOptionChange(gIndex, oIndex, 'prepTime', Number(e.target.value))} placeholder="Prep Time" className="w-24 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-gold outline-none" />
                                                            <button type="button" onClick={() => handleRemoveOption(gIndex, oIndex)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors">
                                                                <MinusCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => handleAddOption(gIndex)} className="text-xs text-gold hover:text-white mt-2 flex items-center gap-1 transition-colors">
                                                        <Plus className="w-3 h-3" /> Add Option
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-white/10 sticky bottom-0 bg-charcoal pb-4">
                                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-gold text-charcoal font-bold hover:bg-opacity-90 flex items-center gap-2 transition-colors">
                                    <Save className="w-4 h-4" /> Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

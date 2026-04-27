import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { reorderItems } from '../services/orderService';
import toast from 'react-hot-toast';

/**
 * useReorder — Custom hook for reorder functionality
 * Calls reorder API, adds items to cart, shows warnings, navigates to cart
 */
const useReorder = () => {
    const [reordering, setReordering] = useState(false);
    const navigate = useNavigate();
    const { dispatch } = useCart();

    const handleReorder = useCallback(async (orderId) => {
        if (reordering) return;
        setReordering(true);

        const loadingToast = toast.loading('Preparing your reorder...');

        try {
            const data = await reorderItems(orderId);

            toast.dismiss(loadingToast);

            // Show warnings for unavailable or price-changed items
            if (data.warnings && data.warnings.length > 0) {
                data.warnings.forEach(w => {
                    if (w.reason === 'Price updated') {
                        toast(`${w.name}: Price changed Rs.${w.oldPrice} → Rs.${w.newPrice}`, {
                            icon: '💰',
                            duration: 4000,
                            style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(212,175,55,0.3)' }
                        });
                    } else {
                        toast(`${w.name}: ${w.reason}`, {
                            icon: '⚠️',
                            duration: 4000,
                            style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(220,38,38,0.3)' }
                        });
                    }
                });
            }

            // Add items to cart
            if (data.cartItems && data.cartItems.length > 0) {
                // Clear cart first
                dispatch({ type: 'CLEAR_CART' });

                // Add each item
                data.cartItems.forEach(item => {
                    dispatch({
                        type: 'ADD_TO_CART',
                        payload: item
                    });
                });

                toast.success(`${data.cartItems.length} item${data.cartItems.length > 1 ? 's' : ''} added to cart!`, {
                    duration: 3000,
                    style: { background: '#1a1a1a', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }
                });

                // Navigate to cart
                navigate('/cart');
            } else {
                toast.error('No items available to reorder');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            const msg = error.response?.data?.message || 'Failed to reorder. Please try again.';
            toast.error(msg);
        } finally {
            setReordering(false);
        }
    }, [reordering, dispatch, navigate]);

    return { handleReorder, reordering };
};

export default useReorder;

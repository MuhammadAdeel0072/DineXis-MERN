import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useProfile } from './AuthContext';
import apiClient from '../services/apiClient';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cartItems: action.payload,
        loading: false
      };
    case 'ADD_TO_CART':
      const item = action.payload;
      const existItem = state.cartItems.find((x) => 
        x.product === item.product && 
        x.selectedVariant?.name === item.selectedVariant?.name
      );

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            (x.product === existItem.product && 
             x.selectedVariant?.name === existItem.selectedVariant?.name) ? item : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => 
          !(x.product === action.payload.product && 
            x.selectedVariant?.name === action.payload.selectedVariant?.name)
        ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isSignedIn } = useProfile();
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    loading: false
  });

  // Sync with LocalStorage and Backend
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    
    // Backend Sync Protocol
    const syncCart = async () => {
      if (isSignedIn) {
        try {
          await apiClient.post('/cart', { cartItems: state.cartItems });
        } catch (error) {
          console.error('Cart Sync Failure:', error);
        }
      }
    };

    const timeoutId = setTimeout(syncCart, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [state.cartItems, isSignedIn]);

  // Initial Fetch from Backend
  useEffect(() => {
    const fetchCart = async () => {
      if (isSignedIn) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const { data } = await apiClient.get('/cart');
          if (data && Array.isArray(data)) {
            dispatch({ type: 'SET_CART', payload: data });
          }
        } catch (error) {
          console.error('Failed to fetch backend cart:', error);
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };
    fetchCart();
  }, [isSignedIn]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

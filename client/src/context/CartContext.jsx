import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useProfile } from './UserContext';
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
        JSON.stringify(x.customizations) === JSON.stringify(item.customizations)
      );

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            (x.product === existItem.product && JSON.stringify(x.customizations) === JSON.stringify(existItem.customizations)) ? item : x
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
          !(x.product === action.payload.product && JSON.stringify(x.customizations) === JSON.stringify(action.payload.customizations))
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

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Sync with Backend for signed-in users
  useEffect(() => {
    const syncCart = async () => {
      if (isSignedIn) {
        try {
          // Fetch backend cart on login
          const { data } = await apiClient.get('/users/cart');
          if (data && data.length > 0) {
            dispatch({ type: 'SET_CART', payload: data });
          } else if (state.cartItems.length > 0) {
            // If backend empty but local has items, push local to backend
            await apiClient.put('/users/cart', { cartItems: state.cartItems });
          }
        } catch (error) {
          console.error('Error syncing cart with backend', error);
        }
      }
    };
    syncCart();
  }, [isSignedIn]);

  // Push updates to backend
  useEffect(() => {
    const pushCart = async () => {
      if (isSignedIn && state.cartItems.length > 0) {
        try {
          await apiClient.put('/users/cart', { cartItems: state.cartItems });
        } catch (error) {
          console.error('Error pushing cart to backend', error);
        }
      }
    };
    
    // Debounce push to avoid excessive API calls
    const timeout = setTimeout(pushCart, 2000);
    return () => clearTimeout(timeout);
  }, [state.cartItems, isSignedIn]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

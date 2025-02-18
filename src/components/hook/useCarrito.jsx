import React, { createContext, useContext, useReducer } from 'react';

const CarritoContext = createContext();

const carritoReducer = (state, action) => {
  switch (action.type) {
    case 'AGREGAR_AL_CARRITO':
      return [...state, action.producto];
    case 'ELIMINAR_DEL_CARRITO':
      return state.filter(item => item.id !== action.id);
    case 'VACIAR_CARRITO':
      return [];
    default:
      return state;
  }
};

export const CarritoProvider = ({ children }) => {
  const [carrito, dispatch] = useReducer(carritoReducer, []);

  return (
    <CarritoContext.Provider value={{ carrito, dispatch }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
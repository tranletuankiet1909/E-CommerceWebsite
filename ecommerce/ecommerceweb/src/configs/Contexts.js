// src/configs/Contexts.js
import React, { createContext, useReducer } from 'react';

const initialState = {
    user: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'login':
            return { ...state, user: action.payload };
        case 'logout':
            return { ...state, user: null };
        default:
            return state;
    }
};

const Contexts = createContext(initialState);

export const ContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <Contexts.Provider value={{ state, dispatch }}>
            {children}
        </Contexts.Provider>
    );
};

export default Contexts;

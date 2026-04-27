import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("sitenex_token") || null);
    const [loading, setLoading] = useState(true);

    // On mount, if we have a stored token, fetch the user profile
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await axios.get(`${backendUrl}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Token validation failed:", error);
                // Token is invalid — clear it
                localStorage.removeItem("sitenex_token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const { data } = await axios.post(`${backendUrl}/users/login`, { email, password });
        if (data.success) {
            localStorage.setItem("sitenex_token", data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    const register = async (formData) => {
        const { data } = await axios.post(`${backendUrl}/users/register`, formData);
        if (data.success) {
            localStorage.setItem("sitenex_token", data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem("sitenex_token");
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

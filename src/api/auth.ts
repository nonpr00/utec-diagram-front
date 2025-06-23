import axios from "./axios.ts";

export const registerRequest = async (user) => axios.post(`/user/register`, user);

export const loginRequest = async (user) => axios.post(`/user/login`, user);

//export const logoutRequest = async () => axios.post(`/auth/logout`);

export const verifyTokenRequest = async (token) => axios.post(`/user/verify`, { token });
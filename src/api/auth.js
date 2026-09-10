import { handleResponse, handleError } from "./apiUtils";
import axios from "axios";

const baseUrl = process.env.API_URL ? process.env.API_URL : 'https://vaucher-restaurante-api.vercel.app';
const baseUrlAuth = baseUrl;

export function getLogin(credentials) {
    return axios.post(baseUrlAuth + "/login", credentials)
      .then(handleResponse)
      .catch(handleError);
}

export function getVerification(tokenParam) {
    return axios.post(baseUrlAuth + "/verify", {token: tokenParam})
      .then(handleResponse)
      .catch(handleError);
}


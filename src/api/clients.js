import { handleResponse, handleError } from "./apiUtils";
import axios from "axios";

//const baseUrl = process.env.API_URL ? process.env.API_URL : 'http://localhost:3002';

const baseUrl = process.env.API_URL ? process.env.API_URL : 'https://vaucher-restaurante-api.vercel.app';
const baseUrlRegister = baseUrl;

export function getClients(onlyActive = true) {
    const params = onlyActive ? { active: true } : undefined;

    return axios.get(baseUrlRegister + '/customers', { params })
    .then(handleResponse)
    .catch(handleError);
}


// Busca cliente por ID
export function getClientById(id) {
  return axios.get(baseUrlRegister + `/customer/${id}`)
    .then(handleResponse)
    .catch(handleError);
}

export function saveClient(customer) {
  return axios.post(baseUrlRegister + '/customers', customer)
    .then(handleResponse)
    .catch(handleError);
}

// Atualiza cliente por ID
export function clientUpdate(id, customer) {
  return axios.put(baseUrlRegister + `/customer/${id}`, customer)
    .then(handleResponse)
    .catch(handleError);
}

export function clientDeleted(id) {
  return axios.delete(baseUrlRegister + `/customer/${id}`)
    .then(handleResponse)
    .catch(handleError)
}

const buildAmountPayload = (amount) => {
  const numericAmount = Number(amount);
  return {
    voucher: Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0,
  };
};

export function sellVoucher(id, amount) {
  return axios.post(`${baseUrlRegister}/amount/${id}`, buildAmountPayload(amount))
    .then(handleResponse)
    .catch(handleError);
}

export function debitVoucher(id, amount) {
  return axios.post(`${baseUrlRegister}/debit/${id}`, buildAmountPayload(amount))
    .then(handleResponse)
    .catch(handleError);
}

// Retorna o extrato de movimentacoes de voucher para consultas e dashboards.
export function getVoucherTransactions(params = {}) {
  return axios.get(`${baseUrlRegister}/transactions`, { params })
    .then(handleResponse)
    .catch(handleError);
}

export function reverseVoucherTransaction(id, reason) {
  return axios.post(`${baseUrlRegister}/transactions/${id}/reversal`, { reason })
    .then((response) => response.data)
    .catch(handleError);
}

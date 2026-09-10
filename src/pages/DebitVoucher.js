import React, { useState, useEffect } from "react";
import { debitVoucher, getClients } from "../api/clients";
import MainHeader from "../components/MainHeader";
import Navbar from "../components/Navbar";
import { toast } from 'react-toastify';
import TablePagination from '../components/TablePagination';

function DebitVoucher() {

  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const visibleClients = clients.slice((tablePage - 1) * 10, tablePage * 10);

   const normalizeClients = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.customers)) return data.customers;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  useEffect(() => {
      retrieveClients();
  }, []);

  const retrieveClients = (id, amount) => {
    getClients().then((data) => {
      const normalized = normalizeClients(data);
      setClients(normalized);
      setAllClients(normalized);
    }).catch((error) => {
      toast.error('Erro ao buscar clientes:', error);
    });
  }

  const handleDebitVoucher = async (selectedClient, amount) => {
    if (isSubmitting) return;

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.warn('Informe um valor vAlido para debitar.');
      return;
    }

    const id = selectedClient?.id || selectedClient?._id;

    if (amount > selectedClient.voucher) {
      toast.warn("Saldo de voucher insuficiente.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await debitVoucher(id, amount);

      toast.success('Saldo debitado com sucesso ');

      const updated = response.cliente || response;
      setClients((prev) => prev.map((c) => (c.id === id || c._id === id ? updated : c)));
      setAllClients((prev) => prev.map((c) => (c.id === id || c._id === id ? updated : c)));
      setSelectedClient(updated);
      setBalance(updated.voucher ?? Number(balance) - Number(amount));
      setAmount('');
      setShowModal(false);

    } catch (error) {
      toast.error('Erro ao debitar saldo ', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao debitar saldo';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  function displayModal(client) {
    if (client) {
      setSelectedClient(client);
      setBalance(client.voucher || 0);
      setShowModal(true);
      return;
    }
    setShowModal(false);
    setSelectedClient(null);
    setAmount('');
  }

  function getAmount(e) {
    const value = e.target.value;
    setAmount(value);
  }

  const filterCustomers = (value) => {
    setSearch(value);
    const searchText = value.toLowerCase().trim();
    const cpfSearch = searchText.replace(/\D/g, '');

    if (!searchText) {
      setClients(allClients);
      return;
    }

    const filtered = allClients.filter(client =>
      client.nome?.toLowerCase().includes(searchText) ||
      client.cpf?.toLowerCase().includes(searchText) ||
      (cpfSearch && String(client.cpf || '').replace(/\D/g, '').includes(cpfSearch))
    );

    setClients(filtered);
  };

  const handleSearchEvent = (event) => {
    filterCustomers(event.currentTarget.value);
  };

  const handleSearchPaste = (event) => {
    const input = event.currentTarget;
    setTimeout(() => filterCustomers(input.value), 0);
  };

  useEffect(() => {
    if (search) filterCustomers(search);
  }, [allClients]);

  useEffect(() => setTablePage(1), [search, clients.length]);
  
  return (
    <>

      <Navbar />
      <MainHeader/>
      <main className="px-10 py-6">

        <div className="">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Debitar Voucher</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie e debite saldo para os clientes cadastrados</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
          <div className="p-4 bg-white border-b border-gray-100"><input className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none" placeholder="Busque por nome ou cpf" value={search} onChange={handleSearchEvent} onInput={handleSearchEvent} onKeyUp={handleSearchEvent} onPaste={handleSearchPaste} /></div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left text-white font-semibold px-6 py-4 tracking-wide">Nome</th>
                <th className="text-left text-white font-semibold px-6 py-4 tracking-wide">Telefone</th>
                <th className="text-left text-white font-semibold px-6 py-4 tracking-wide">CPF</th>
                <th className="text-left text-white font-semibold px-6 py-4 tracking-wide">Saldo atual</th>
                <th className="text-center text-white font-semibold px-6 py-4 tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client, index) => (
                <tr key={client.id || client._id} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 text-gray-700 font-medium">{client.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{client.telefone}</td>
                  <td className="px-6 py-4 text-gray-600">{client.cpf}</td>
                  <td className="px-6 py-4 text-gray-600">R$ {(client.voucher || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                  {clients.length === 1 ?
                    <button onClick={() => displayModal(client)} className="bg-[#FF9933] px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity">
                      - Debitar
                    </button> : ''}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
          <TablePagination page={tablePage} total={clients.length} onPageChange={setTablePage} />
        </div>

        <div data-testid="voucher-operation-modal" className={` ${showModal ? 'block' : 'hidden'} fixed inset-0 bg-black/40 flex items-center justify-center`}>
          <div className=" bg-white rounded-2xl shadow-2xl p-8">
            <div className=" flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Debitar Voucher</h2>
                <p className="text-sm text-gray-500 mt-1">Cliente: <strong className=" text-gray-500">{selectedClient ? selectedClient.nome : 'a'}</strong></p>
              </div>
              <button onClick={() => displayModal()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">x</button>
            </div>

            <div className=" rounded-xl p-4 mb-5 flex items-center gap-4 bg-[#e8f5e8]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#5B9A5B]">
                <span className=" text-white font-bold">R$</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Saldo Atual</p>
                <p className="text-2xl font-bold text-[#2e7d32]">R$ {Number(balance || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Valor a Debitar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">R$</span>
                <input value={amount} onChange={getAmount} type="number" placeholder="0,00" className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none text-gray-700 border-[#FF9933]" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => displayModal()} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button
                data-testid="confirm-voucher-operation"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDebitVoucher(selectedClient, amount)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#5B9A5B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar'}
              </button>
            </div>

          </div>

        </div>

      </main>
      
    </>
  );
};

export default DebitVoucher;

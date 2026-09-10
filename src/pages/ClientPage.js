import { useState, useEffect, useMemo } from "react";
import { getClients, saveClient, clientDeleted, clientUpdate, getClientById } from "../api/clients";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar";
import MainHeader from "../components/MainHeader";
import TablePagination from "../components/TablePagination";

function ClientPages() {

    const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    endereco: "",
    observacao: "",
  });

  const [errors, setErrors] = useState({});
  const [sucesso, setSucesso] = useState(null);
  const [pageShow, setPageShow] = useState('SHOW_CUSTOMERS_TABLE');
  const [clients, setClients] = useState([]);
  const [editingClientId, setEditingClientId] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const normalizeClients = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.customers)) return data.customers;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  useEffect(() => {
    getClients().then((data) => setClients(normalizeClients(data)));
  }, []);

  const apenasDigitos = (s = "") => s.replace(/\D/g, "");
  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    const cpfTerm = term.replace(/\D/g, '');

    return clients.filter((client) =>
      String(client.nome || '').toLowerCase().includes(term) ||
      String(client.cpf || '').toLowerCase().includes(term) ||
      (cpfTerm && String(client.cpf || '').replace(/\D/g, '').includes(cpfTerm))
    );
  }, [clients, search]);

  const visibleClients = filteredClients.slice((tablePage - 1) * 10, tablePage * 10);

  useEffect(() => setTablePage(1), [clients.length, search]);

  const handleSearchEvent = (event) => setSearch(event.currentTarget.value);
  const handleSearchPaste = (event) => {
    const input = event.currentTarget;
    setTimeout(() => setSearch(input.value), 0);
  };

  // MAscara simples para CPF: 000.000.000-00
  const formatCpf = (value) => {
    const d = apenasDigitos(value).slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // MAscara simples para telefone: (00) 00000-0000 ou (00) 0000-0000
  const formatTelefone = (value) => {
    const d = apenasDigitos(value).slice(0, 11);
    if (d.length <= 10) {
      return d
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novoValor = value;

    if (name === "cpf") novoValor = formatCpf(value);
    if (name === "telefone") novoValor = formatTelefone(value);

    setForm((s) => ({ ...s, [name]: novoValor }));
  };

  const validar = () => {
    const err = {};
    if (!form.nome) err.nome = "Nome completo A obrigatório.";

    const cpfDigits = apenasDigitos(form.cpf);
    if (!cpfDigits) err.cpf = "CPF A obrigatório.";
    else if (cpfDigits.length !== 11) err.cpf = "CPF deve ter 11 dAgitos.";

    if (!form.email) err.email = "E-mail A obrigatório.";

    const telDigits = apenasDigitos(form.telefone);
    if (!telDigits) err.telefone = "Telefone A obrigatório.";
    else if (telDigits.length < 10) err.telefone = "Telefone inválido.";

    if (!form.endereco) err.endereco = "Endereço é obrigatorio.";

    return err;
  };


  const cadastrarCliente = async (payload) => {
    try {
      const novoCliente = await saveClient(payload);
      // Se o backend retorna o cliente criado, adiciona ao estado
      if (novoCliente && (novoCliente._id || novoCliente.id)) {
        setClients((prev) => [...prev, novoCliente]);
      } else {
        // fallback: busca todos se nAo retornar o cliente
        const updatedClients = await getClients();
        setClients(normalizeClients(updatedClients));
      }
    } catch (e) {
      // fallback: busca todos em caso de erro
      const updatedClients = await getClients();
      setClients(normalizeClients(updatedClients));
    }
  };

  const atualizarCliente = async (id, payload) => {
    await clientUpdate(id, payload);
    const updatedClients = await getClients();
    setClients(normalizeClients(updatedClients));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setSucesso(null);

    const err = validar();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const payload = {
      ...form,
      cpf: apenasDigitos(form.cpf),
      telefone: apenasDigitos(form.telefone),
    };

    try {
      setIsSaving(true);
      if (editingClientId) {
        await atualizarCliente(editingClientId, payload);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await cadastrarCliente(payload);
        toast.success("Cliente cadastrado com sucesso!");
      }
      setErrors({});
      setForm({
        nome: "",
        cpf: "",
        telefone: "",
        endereco: "",
        observacao: "",
      });
      setEditingClientId(null);
      setPageShow('SHOW_CUSTOMERS_TABLE');
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClient = async (id) => {
    try {
      console.log('Editando cliente, id:', id);
      const data = await getClientById(id);
      console.log('Resposta do backend ao buscar cliente:', data);
      // Aceita tanto {nome, ...} quanto {customer: {...}}
      const cliente = data.customer || data;
      setForm({
        nome: cliente.nome || "",
        cpf: cliente.cpf || "",
        telefone: cliente.telefone || "",
        endereco: cliente.endereco || "",
        observacao: cliente.observacao || "",
        email: cliente.email || ""
      });
      setEditingClientId(id);
      setPageShow('SHOW_CUSTOMERS_FORM');
    } catch (error) {
      console.error("Erro ao buscar cliente para ediAAo:", error);
    }
  };

  const handleDeleteClient = async (id) => {
    console.log("Tentando excluir cliente com ID:", id);
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }
    
    if (!id) {
      console.error("ID do cliente nAo encontrado");
      return;
    }

    try {
      await clientDeleted(id);
      
      setSucesso("Cliente excluAdo com sucesso!");
      
      // Fetch fresh data from backend after deletion
      const updatedClients = await getClients();
      setClients(normalizeClients(updatedClients));
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      setSucesso(null);
      toast.error("Erro ao excluir cliente. Tente novamente.");
    }
  };

  const showCadastrarNovo = () => {
    setPageShow('SHOW_CUSTOMERS_FORM');
  };

  const showCustomersTable = () => {
    setPageShow('SHOW_CUSTOMERS_TABLE');
  };

  return (
    <>
    <Navbar />
    <MainHeader />
    <div className="bg-gray-50 min-h-screen">
      {pageShow === 'SHOW_CUSTOMERS_TABLE' &&
      <div className="">
        <div className="" style={{ margin: '1rem'}}>
            <button
            data-testid="add-customer"
            style={{ backgroundColor: '#2f7d59', color: 'white'}}
              onClick={() => showCadastrarNovo()}
              className=" font-semibold text-base px-12 py-3 rounded-lg shadow transition-colors"
            >
              {"Adicionar Novo"}
            </button>

            <h3 style={{ marginTop: '1rem'}} className="text-xl font-semibold text-slate-500">Clientes Cadastrados</h3>
            <p style={{ marginTop: '1rem', marginBottom: '1rem'}} >Gerencie e visualize os clientes cadastrados no sistema.</p>
        </div>
        <div style={{ margin: '1rem'}} className="rounded-xl overflow-hidden shadow-md border border-gray-100">
          <div className="p-4 bg-white border-b border-gray-100">
            <input
              value={search}
              onChange={handleSearchEvent}
              onInput={handleSearchEvent}
              onKeyUp={handleSearchEvent}
              onPaste={handleSearchPaste}
              placeholder="Buscar por nome ou CPF"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-6 py-4 font-semibold tracking-wide">Nome</th>
                <th className="text-left px-6 py-4 font-semibold tracking-wide">CPF</th>
                <th className="text-left px-6 py-4 font-semibold tracking-wide">Telefone</th>
                <th className="text-left px-6 py-4 font-semibold tracking-wide">Endereço</th>
                <th className="text-left px-6 py-4 font-semibold tracking-wide">E-mail</th>
                <th className="text-center px-4 py-4 font-semibold tracking-wide">Editar</th>
                <th className="text-center px-4 py-4 font-semibold tracking-wide">Excluir</th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client, index) => (
                <tr
                  key={client._id || client.cpf}
                  className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 text-gray-700 font-medium">{client.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{client.cpf}</td>
                  <td className="px-6 py-4 text-gray-600">{client.telefone}</td>
                  <td className="px-6 py-4 text-gray-600">{client.endereco}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      aria-label="Editar cliente"
                      onClick={() => handleEditClient(client._id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <FontAwesomeIcon icon={faUserPen} className="text-lg" />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      aria-label="Excluir cliente"
                      onClick={() => handleDeleteClient(client._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination page={tablePage} total={filteredClients.length} onPageChange={setTablePage} />
        </div>
      </div>}

      {pageShow === 'SHOW_CUSTOMERS_FORM' &&
      <div >
        <div className=""  >
          <button
            style={{ margin: '1rem', backgroundColor: '#2f7d59', color: 'white'}}
            onClick={() => showCustomersTable()}
            className="text-base px-12 py-3 rounded-lg shadow transition-colors"
          >
            {"Voltar para a lista de clientes"}
          </button>
        </div>
        <div className="flex flex-col items-center mt-8 gap-3">
            <div className="bg-white rounded-2xl shadow-md w-[640px] px-16 py-12">
              <h2 className="text-center text-2xl font-semibold text-slate-500 mb-10">Cadastro de Clientes</h2>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    Nome completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Ex.: JoAo da Silva"
                    className={`w-full border rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none bg-white ${
                      errors.nome ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-400"
                    }`}
                    required
                  />
                  {errors.nome && <small className="text-red-500 text-xs mt-1 block">{errors.nome}</small>}
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    CPF <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    className={`w-full border rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none bg-white ${
                      errors.cpf ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-400"
                    }`}
                    required
                  />
                  {errors.cpf && <small className="text-red-500 text-xs mt-1 block">{errors.cpf}</small>}
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    E-mail <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Ex.: abc@gmail.com"
                    inputMode="email"
                    className={`w-full border rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none bg-white ${
                      errors.cpf ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-400"
                    }`}
                    required
                  />
                  {errors.email && <small className="text-red-500 text-xs mt-1 block">{errors.email}</small>}
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    Telefone <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(00) 90000-0000"
                    inputMode="tel"
                    className={`w-full border rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none bg-white ${
                      errors.telefone ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-400"
                    }`}
                    required
                  />
                  {errors.telefone && <small className="text-red-500 text-xs mt-1 block">{errors.telefone}</small>}
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    Endereço <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="endereco"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Rua, nAmero, bairro, cidade - UF"
                    className={`w-full border rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none bg-white ${
                      errors.endereco ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-green-400"
                    }`}
                    required
                  />
                  {errors.endereco && <small className="text-red-500 text-xs mt-1 block">{errors.endereco}</small>}
                </div>

                <div>
                  <label className="block text-sm text-slate-500 mb-1">
                    Observação <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    name="observacao"
                    value={form.observacao}
                    onChange={handleChange}
                    placeholder="Observações, preferências, informações adicionais"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-400 placeholder-gray-300 text-sm focus:outline-none focus:border-green-400 bg-white h-28 resize-none"
                  />
                </div>

                <div className="flex flex-col items-center mt-8 gap-3">
                  <button
                    type="submit"
                    data-testid="save-customer"
                    disabled={isSaving}
                    style={{ margin: '1rem', backgroundColor: '#2f7d59', color: 'white'}}
                    className="font-semibold text-base px-12 py-3 rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Processando..." : editingClientId ? "Salvar" : "Cadastrar"}
                  </button>
                  <p className="text-slate-400 text-xs">* Campos obrigatórios.</p>
                </div>
              </form>
            </div>
          </div>
        </div>}
    </div>
    </>
  );
}

export default ClientPages;

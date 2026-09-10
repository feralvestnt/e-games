import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import MainHeader from '../components/MainHeader';
import Navbar from '../components/Navbar';
import { getVoucherTransactions, reverseVoucherTransaction } from '../api/clients';
import TablePagination from '../components/TablePagination';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const normalizeTransactions = (data) => Array.isArray(data) ? data : data?.transactions || data?.movements || data?.data || [];
const typeOf = (item) => String(item.type || item.tipo || '').toUpperCase();
const amountOf = (item) => Number(item.amount ?? item.valor ?? 0);
const nameOf = (item) => item.customer?.nome || item.cliente?.nome || item.clientName || item.nomeCliente || '-';
const cpfOf = (item) => item.customer?.cpf || item.cliente?.cpf || item.clientCpf || item.cpf || '-';
const dateOf = (item) => item.createdAt || item.date || item.data || item.updatedAt;
const isWithinWeek = (item) => {
  const date = new Date(dateOf(item));
  return !Number.isNaN(date.getTime()) && Date.now() - date.getTime() <= WEEK_IN_MS;
};
const isEligible = (item) => ['VENDA', 'DEBITO'].includes(typeOf(item)) && item.status !== 'ESTORNADA' && !item.reversalTransaction && isWithinWeek(item);
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const dateTime = (value) => new Date(value).toLocaleString('pt-BR');

function VoucherReversal() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tablePage, setTablePage] = useState(1);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      setTransactions(normalizeTransactions(await getVoucherTransactions()));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nao foi possivel carregar as movimentacoes.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const filtersComplete = Boolean(search.trim() && amount && Number(amount) > 0 && type);
  const filtered = useMemo(() => {
    if (!filtersComplete) return [];
    const term = search.trim().toLowerCase();
    const targetAmount = Number(amount);
    return transactions.filter((item) =>
      isEligible(item) &&
      typeOf(item) === type &&
      [nameOf(item), cpfOf(item)].some((value) => String(value).toLowerCase().includes(term)) &&
      Math.abs(amountOf(item) - targetAmount) < 0.001
    );
  }, [transactions, search, amount, type, filtersComplete]);

  const canReverse = filtered.length === 1;
  useEffect(() => setTablePage(1), [search, amount, type, filtered.length]);
  const visibleTransactions = filtered.slice((tablePage - 1) * 10, tablePage * 10);
  const closeModal = () => {
    if (submitting) return;
    setSelected(null);
    setReason('');
  };

  const confirmReversal = async () => {
    if (submitting) return;
    if (!reason.trim()) {
      toast.warn('Informe o motivo do estorno.');
      return;
    }
    try {
      setSubmitting(true);
      await reverseVoucherTransaction(selected._id || selected.id, reason.trim());
      toast.success('Estorno realizado com sucesso.');
      setSelected(null);
      setReason('');
      await loadTransactions();
    } catch (error) {
      const responseMessage = error.response?.data?.error || error.response?.data?.message;
      const isInsufficientBalance = error.response?.status === 400 && /saldo.*insuficiente/i.test(responseMessage || '');

      toast[isInsufficientBalance ? 'warn' : 'error'](
        isInsufficientBalance
          ? 'Saldo atual insuficiente para estornar esta venda. Verifique os debitos posteriores.'
          : responseMessage || 'Nao foi possivel realizar o estorno.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <MainHeader />
      <main className="px-10 py-6 bg-gray-50 min-h-screen">
        <div className="mb-6 border-l-4 pl-4" style={{ borderColor: '#2f7d59' }}>
          <h1 className="text-2xl font-bold text-gray-800">Estorno de vouchers</h1>
          <p className="text-sm text-gray-500 mt-1">Localize uma unica operacao pelos filtros obrigatorios. Estornos sao permitidos por ate sete dias.</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ borderColor: '#f1d3bb' }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou CPF" className="flex-1 min-w-52 px-4 py-2 border border-gray-200 rounded-lg" />
          <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0.01" step="0.01" placeholder="Valor da operacao" className="w-44 px-4 py-2 border border-gray-200 rounded-lg" />
          <select value={type} onChange={(event) => setType(event.target.value)} className="w-44 px-4 py-2 border border-gray-200 rounded-lg text-gray-700">
            <option value="">Tipo da operacao</option><option value="VENDA">Venda</option><option value="DEBITO">Debito</option>
          </select>
          <button onClick={loadTransactions} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm disabled:opacity-60" style={{ backgroundColor: '#374151' }}>Atualizar</button>
          {canReverse && <button onClick={() => setSelected(filtered[0])} className="px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: '#2f7d59' }}>Estornar operacao</button>}
        </div>

        {!filtersComplete && <p className="mb-4 rounded-lg border px-4 py-3 text-sm font-medium" style={{ color: '#9A4D00', backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>Preencha nome ou CPF, valor e tipo para liberar a busca de estorno.</p>}
        {filtersComplete && filtered.length !== 1 && !loading && <p className="mb-4 rounded-lg border px-4 py-3 text-sm font-medium" style={{ color: '#9A4D00', backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>A busca deve retornar exatamente uma operacao elegivel para estorno.</p>}

        <div className="rounded-xl overflow-x-auto shadow-md border border-gray-100 bg-white"><table className="w-full text-sm"><thead><tr className="bg-gray-800 text-white"><th className="text-left px-6 py-4">Data</th><th className="text-left px-6 py-4">Cliente</th><th className="text-left px-6 py-4">CPF</th><th className="text-left px-6 py-4">Tipo</th><th className="text-right px-6 py-4">Valor</th><th className="text-center px-6 py-4">Acao</th></tr></thead><tbody>
          {loading && <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Carregando movimentacoes...</td></tr>}
          {!loading && filtersComplete && filtered.length === 0 && <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Nenhuma operacao elegivel encontrada.</td></tr>}
          {!loading && visibleTransactions.map((item) => <tr key={item._id || item.id} className="border-b border-gray-100 hover:bg-orange-50"><td className="px-6 py-4 text-gray-600">{dateTime(dateOf(item))}</td><td className="px-6 py-4 font-semibold text-gray-800">{nameOf(item)}</td><td className="px-6 py-4 text-gray-600">{cpfOf(item)}</td><td className="px-6 py-4"><span className="rounded-full px-3 py-1 text-xs font-bold" style={{ color: '#1f4d3a', backgroundColor: '#e6f3ec' }}>{typeOf(item) === 'VENDA' ? 'Venda' : 'Debito'}</span></td><td className="px-6 py-4 text-right font-bold text-gray-800">{money(amountOf(item))}</td><td className="px-6 py-4 text-center"><button onClick={() => setSelected(item)} className="px-4 py-2 rounded-lg text-white text-sm font-bold shadow-sm" style={{ backgroundColor: '#2f7d59' }}>Estornar</button></td></tr>)}
        </tbody></table><TablePagination page={tablePage} total={filtered.length} onPageChange={setTablePage} /></div>
      </main>

      {selected && (
        <div data-testid="reversal-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ padding: '24px' }}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxWidth: '640px' }}>
            <div className="text-white" style={{ backgroundColor: '#1f4d3a', padding: '24px 32px' }}>
              <h2 className="text-xl font-bold">Confirmar estorno</h2>
              <p className="mt-1 text-sm text-orange-100">Revise os dados antes de confirmar esta correcao.</p>
            </div>

            <div style={{ padding: '32px' }}>
              <div className="rounded-xl border" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', padding: '20px' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1f4d3a' }}>Operacao selecionada</p>
                    <p className="mt-1 text-lg font-bold text-gray-800">{nameOf(selected)}</p>
                    <p className="text-sm text-gray-600">CPF: {cpfOf(selected)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">{typeOf(selected) === 'VENDA' ? 'Venda' : 'Debito'}</p>
                    <p className="text-2xl font-bold" style={{ color: '#1f4d3a' }}>{money(amountOf(selected))}</p>
                  </div>
                </div>
                <p className="mt-3 border-t pt-3 text-sm text-gray-600" style={{ borderColor: '#fed7aa' }}>Registrada em {dateTime(dateOf(selected))}</p>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-700">O estorno gera uma movimentacao inversa, atualiza o saldo atual e mantem a operacao original no historico.</p>

              <label className="mt-5 block text-sm font-bold text-gray-700">Motivo do estorno</label>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Descreva o motivo da correcao" className="mt-2 w-full min-h-28 rounded-xl border px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none" style={{ borderColor: '#d1d5db' }} disabled={submitting} />

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button onClick={closeModal} disabled={submitting} className="flex-1 rounded-xl border py-3 text-sm font-bold text-gray-700 disabled:opacity-60" style={{ borderColor: '#d1d5db' }}>Cancelar</button>
                <button data-testid="confirm-reversal" onClick={confirmReversal} disabled={submitting} className="flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60" style={{ backgroundColor: '#2f7d59' }}>{submitting ? 'Processando...' : 'Confirmar estorno'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VoucherReversal;

import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import MainHeader from '../components/MainHeader';
import Navbar from '../components/Navbar';
import { getVoucherTransactions } from '../api/clients';
import TablePagination from '../components/TablePagination';

const normalizeTransactions = (data) =>
  Array.isArray(data)
    ? data
    : data?.transactions || data?.movements || data?.data || [];

const getType = (item) => {
  const value = item.type || item.tipo || item.operation || '';
  if (/estorno_venda/i.test(value)) return 'DEBITO';
  if (/estorno_debito/i.test(value)) return 'VENDA';
  return /debit|debito|saida/i.test(value) ? 'DEBITO' : 'VENDA';
};
const getTransactionLabel = (item) => {
  const value = String(item.type || item.tipo || item.operation || '').toUpperCase();
  if (value === 'ESTORNO_VENDA') return 'Estorno de venda';
  if (value === 'ESTORNO_DEBITO') return 'Estorno de debito';
  return getType(item) === 'VENDA' ? 'Venda' : 'Debito';
};
const isReversal = (item) => /^ESTORNO_/.test(String(item.type || item.tipo || item.operation || '').toUpperCase());

const getAmount = (item) => Number(item.amount ?? item.valor ?? item.voucher ?? 0);
const getClientName = (item) =>
  item.customer?.nome ||
  item.cliente?.nome ||
  item.clientName ||
  item.nomeCliente ||
  item.customerName ||
  '-';
const getClientCpf = (item) =>
  item.customer?.cpf || item.cliente?.cpf || item.clientCpf || item.cpf || '-';
const getDate = (item) => item.createdAt || item.date || item.data || item.updatedAt;

const money = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);

const dateTime = (value) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleString('pt-BR')
    : value || '-';

function VoucherHistory() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const loadTransactions = async () => {
    setLoading(true);

    try {
      setTransactions(normalizeTransactions(await getVoucherTransactions()));
    } catch (error) {
      setTransactions([]);
      toast.error(
        error.response?.data?.message || 'Nao foi possivel carregar o histórico.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesType = type === 'TODOS' || (type === 'ESTORNO' ? isReversal(item) : getType(item) === type);
      const matchesSearch =
        !term ||
        [getClientName(item), getClientCpf(item)].some((value) =>
          String(value).toLowerCase().includes(term)
        );

      return matchesType && matchesSearch;
    });
  }, [transactions, search, type]);

  useEffect(() => setTablePage(1), [search, type, filtered.length]);
  const visibleTransactions = filtered.slice((tablePage - 1) * 10, tablePage * 10);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (summary, item) => {
          if (getType(item) === 'VENDA') {
            summary.sales += getAmount(item);
          } else {
            summary.debits += getAmount(item);
          }

          return summary;
        },
        { sales: 0, debits: 0 }
      ),
    [filtered]
  );

  const handleSearchEvent = (event) => {
    setSearch(event.currentTarget.value);
  };

  const handleSearchPaste = (event) => {
    const input = event.currentTarget;
    setTimeout(() => setSearch(input.value), 0);
  };

  return (
    <>
      <Navbar />
      <MainHeader />

      <main className="px-10 py-6 bg-gray-50 min-h-screen">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Histórico de Vouchers
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Vendas e debitos registrados para consulta e futuros dashboards.
            </p>
          </div>

          <button
            onClick={loadTransactions}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Summary
            label="Total de vendas"
            value={money(totals.sales)}
            color="text-green-700"
          />
          <Summary
            label="Total de debitos"
            value={money(totals.debits)}
            color="text-orange-600"
          />
          <Summary
            label="Movimentacoes"
            value={filtered.length}
            color="text-gray-800"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={handleSearchEvent}
            onInput={handleSearchEvent}
            onKeyUp={handleSearchEvent}
            onPaste={handleSearchPaste}
            placeholder="Buscar por nome ou CPF"
            className="flex-1 min-w-[240px] px-4 py-2 border border-gray-200 rounded-lg"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700"
          >
            <option value="TODOS">Todas as movimentacoes</option>
            <option value="VENDA">Vendas</option>
            <option value="DEBITO">Debitos</option>
            <option value="ESTORNO">Estornos</option>
          </select>
        </div>

        <div className="rounded-xl overflow-x-auto shadow-md border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-6 py-4">Data</th>
                <th className="text-left px-6 py-4">Cliente</th>
                <th className="text-left px-6 py-4">CPF</th>
                <th className="text-left px-6 py-4">Tipo</th>
                <th className="text-right px-6 py-4">Valor</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              )}

              {visibleTransactions.map((item, index) => {
                const isSale = getType(item) === 'VENDA';
                const reversal = isReversal(item);
                const labelStyle = reversal
                  ? { backgroundColor: '#f3e8ff', color: '#7e22ce' }
                  : isSale
                    ? { backgroundColor: '#dcfce7', color: '#166534' }
                    : { backgroundColor: '#fee2e2', color: '#b91c1c' };
                const amountStyle = reversal
                  ? { color: '#7e22ce' }
                  : isSale
                    ? { color: '#166534' }
                    : { color: '#b91c1c' };

                return (
                  <tr
                    key={item._id || item.id || index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {dateTime(getDate(item))}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {getClientName(item)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {getClientCpf(item)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={labelStyle}>
                        <FontAwesomeIcon icon={reversal ? faRotateRight : isSale ? faArrowUp : faArrowDown} />
                        {getTransactionLabel(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold" style={amountStyle}>
                      {isSale ? '+' : '-'} {money(getAmount(item))}
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Carregando histórico...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination page={tablePage} total={filtered.length} onPageChange={setTablePage} />
        </div>
      </main>
    </>
  );
}

function Summary({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default VoucherHistory;

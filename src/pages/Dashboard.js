import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import MainHeader from '../components/MainHeader';
import Navbar from '../components/Navbar';
import { getClients, getVoucherTransactions } from '../api/clients';

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const normalizeList = (data, keys) => {
  if (Array.isArray(data)) return data;
  return keys.reduce((list, key) => list || data?.[key], null) || [];
};

const getType = (item) => {
  const value = item.type || item.tipo || item.operation || '';
  if (/estorno_venda/i.test(value)) return 'DEBITO';
  if (/estorno_debito/i.test(value)) return 'VENDA';
  return /debit|debito|saida/i.test(value) ? 'DEBITO' : 'VENDA';
};
const getAmount = (item) => Number(item.amount ?? item.valor ?? item.voucher ?? 0);
const getDate = (item) => new Date(item.createdAt || item.date || item.data || 0);
const getCustomerId = (item) => String(item.customer?._id || item.customer || item.customerId || item.clientId || '');
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);

function Dashboard({ showLayout = true }) {
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [idleDays, setIdleDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const [clientData, transactionData] = await Promise.all([
        getClients(false),
        getVoucherTransactions({ limit: 1000 }),
      ]);
      setClients(normalizeList(clientData, ['customers', 'data']));
      setTransactions(normalizeList(transactionData, ['transactions', 'movements', 'data']));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nao foi possivel carregar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const data = useMemo(() => buildDashboardData(clients, transactions, month, idleDays), [clients, transactions, month, idleDays]);

  const content = (
    <main className="bg-gray-50 min-h-screen px-5 py-5 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard de vouchers</h1>
              <p className="text-sm text-gray-500 mt-1">Acompanhe vendas, uso e saldos dos clientes.</p>
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">Carregando dashboard...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ChartCard
                title="Vendido x utilizado x saldo"
                subtitle="Resumo do mes selecionado"
                action={(
                  <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700">
                    {MONTHS.map((label, index) => <option key={label} value={index}>{label}</option>)}
                  </select>
                )}
              >
                <MetricBars values={[
                  { label: 'Vendido', value: data.selected.sales, color: '#16a34a' },
                  { label: 'Utilizado', value: data.selected.debits, color: '#64748b' },
                  { label: 'Saldo', value: data.selected.balance, color: '#2f7d59' },
                ]} />
              </ChartCard>

              <ChartCard title="Evolução das vendas" subtitle={`Total vendido por mes em ${data.year}`}>
                <LineChart data={data.monthly.map((item) => ({ label: item.label, value: item.sales }))} color="#16a34a" />
              </ChartCard>

              <ChartCard title="Clientes novos x recorrentes" subtitle="Clientes com movimentação em cada mes">
                <GroupedBars data={data.monthly} />
              </ChartCard>

              <ChartCard
                title="Saldo parado"
                subtitle="Clientes com saldo sem movimentação recente"
                action={(
                  <select value={idleDays} onChange={(event) => setIdleDays(Number(event.target.value))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700">
                    <option value={30}>30 dias</option>
                    <option value={60}>60 dias</option>
                    <option value={90}>90 dias</option>
                  </select>
                )}
              >
                <IdleBalanceChart idle={data.idle.balance} active={data.idle.activeBalance} clients={data.idle.clients} days={idleDays} />
              </ChartCard>
            </div>
          )}
        </div>
    </main>
  );

  if (!showLayout) return content;

  return (
    <>
      <Navbar />
      <MainHeader />
      {content}
    </>
  );
}

function ChartCard({ title, subtitle, action, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 min-h-[280px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricBars({ values }) {
  const maximum = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="space-y-5 pt-2">
      {values.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="font-bold text-gray-800">{money(item.value)}</span>
          </div>
          <div className="h-5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(item.value / maximum) * 100}%`, backgroundColor: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, color }) {
  const width = 640;
  const height = 190;
  const padding = 25;
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-[205px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" role="img" aria-label="Evolucao mensal das vendas">
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#e5e7eb" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / (data.length - 1);
          const y = height - padding - (item.value / max) * (height - padding * 2);
          return <g key={item.label}><circle cx={x} cy={y} r="4" fill={color} /><text x={x} y={height - 5} textAnchor="middle" className="fill-gray-500 text-[11px]">{item.label}</text></g>;
        })}
      </svg>
      <p className="text-right text-xs text-gray-500 -mt-1">Pico: {money(max)}</p>
    </div>
  );
}

function GroupedBars({ data }) {
  const maximum = Math.max(...data.flatMap((item) => [item.newClients, item.recurring]), 1);

  return (
    <div className="h-[205px] flex items-end justify-between gap-1 pt-3 border-b border-gray-200">
      {data.map((item) => (
        <div key={item.label} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1">
          <div className="w-full flex items-end justify-center gap-0.5 h-[160px]">
            <div title={`Novos: ${item.newClients}`} className="w-2 sm:w-3 rounded-t bg-blue-500" style={{ height: `${Math.max((item.newClients / maximum) * 100, item.newClients ? 3 : 0)}%` }} />
            <div title={`Recorrentes: ${item.recurring}`} className="w-2 sm:w-3 rounded-t bg-violet-500" style={{ height: `${Math.max((item.recurring / maximum) * 100, item.recurring ? 3 : 0)}%` }} />
          </div>
          <span className="text-[10px] text-gray-500">{item.label}</span>
        </div>
      ))}
      <div className="absolute" />
      <div className="sr-only">Barras azuis representam novos clientes e barras roxas representam clientes recorrentes.</div>
    </div>
  );
}

function IdleBalanceChart({ idle, active, clients, days }) {
  const total = idle + active;
  const percent = total ? Math.round((idle / total) * 100) : 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="h-[205px] flex items-center justify-around gap-4">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#2f7d59" strokeWidth="16" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl text-gray-800">{percent}%</strong><span className="text-[10px] text-gray-500">parado</span></div>
      </div>
      <div className="text-sm space-y-3">
        <p><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2" />Parado: <strong>{money(idle)}</strong></p>
        <p><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />Ativo: <strong>{money(active)}</strong></p>
        <p className="text-gray-500">{clients} clientes sem uso ha {days} dias.</p>
      </div>
    </div>
  );
}

function buildDashboardData(clients, transactions, selectedMonth, idleDays) {
  const year = new Date().getFullYear();
  const monthly = MONTHS.map((label, month) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const monthTransactions = transactions.filter((item) => getDate(item) >= start && getDate(item) < end);
    const customerIds = new Set(monthTransactions.map(getCustomerId).filter(Boolean));
    const newClients = [...customerIds].filter((id) => {
      const first = transactions.filter((item) => getCustomerId(item) === id).reduce((earliest, item) => getDate(item) < earliest ? getDate(item) : earliest, new Date(8640000000000000));
      return first >= start && first < end;
    }).length;
    return {
      label,
      sales: monthTransactions.filter((item) => getType(item) === 'VENDA').reduce((total, item) => total + getAmount(item), 0),
      newClients,
      recurring: customerIds.size - newClients,
    };
  });

  const start = new Date(year, selectedMonth, 1);
  const end = new Date(year, selectedMonth + 1, 1);
  const selectedTransactions = transactions.filter((item) => getDate(item) >= start && getDate(item) < end);
  const sales = selectedTransactions.filter((item) => getType(item) === 'VENDA').reduce((total, item) => total + getAmount(item), 0);
  const debits = selectedTransactions.filter((item) => getType(item) === 'DEBITO').reduce((total, item) => total + getAmount(item), 0);
  const currentBalance = clients.reduce((total, client) => total + Number(client.voucher || 0), 0);
  const afterMonth = transactions.filter((item) => getDate(item) >= end);
  const balance = currentBalance + afterMonth.reduce((total, item) => total + (getType(item) === 'VENDA' ? -getAmount(item) : getAmount(item)), 0);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - idleDays);
  const lastTransaction = transactions.reduce((map, item) => {
    const id = getCustomerId(item);
    if (!id || (map[id] && map[id] >= getDate(item))) return map;
    return { ...map, [id]: getDate(item) };
  }, {});
  const idleClients = clients.filter((client) => Number(client.voucher || 0) > 0 && (!lastTransaction[String(client._id || client.id)] || lastTransaction[String(client._id || client.id)] < cutoff));
  const idleBalance = idleClients.reduce((total, client) => total + Number(client.voucher || 0), 0);

  return {
    year,
    monthly,
    selected: { sales, debits, balance: Math.max(balance, 0) },
    idle: { balance: idleBalance, activeBalance: Math.max(currentBalance - idleBalance, 0), clients: idleClients.length },
  };
}

export default Dashboard;

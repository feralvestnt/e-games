const assert = require('node:assert/strict');
const { createCustomer, deleteCustomer } = require('../helpers/customers');
const { balanceForCustomer, sellVoucher, debitVoucher } = require('../helpers/vouchers');

const saleAmount = 100;
const debitAmount = 30;

describe('Saldo apos operacoes no mesmo cliente', () => {
  let customer;

  beforeEach(async () => {
    customer = await createCustomer();
  });

  afterEach(async () => deleteCustomer(customer));

  it('confirma o saldo final apos vender e debitar voucher', async () => {
    const initialBalance = await balanceForCustomer(customer);

    await sellVoucher(customer, saleAmount);
    await debitVoucher(customer, debitAmount);

    const finalBalance = await balanceForCustomer(customer);
    const expectedBalance = Math.round((initialBalance + saleAmount - debitAmount) * 100) / 100;

    assert.equal(finalBalance, expectedBalance);
  });
});

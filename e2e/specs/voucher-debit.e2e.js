const { createCustomer, deleteCustomer } = require('../helpers/customers');
const { balanceForCustomer, sellVoucher, debitVoucher } = require('../helpers/vouchers');
const assert = require('node:assert/strict');

describe('Debito de voucher', () => {
  let customer;
  beforeEach(async () => { customer = await createCustomer(); await sellVoucher(customer, 100); });
  afterEach(async () => deleteCustomer(customer));

  it('subtrai o valor debitado do saldo do cliente', async () => {
    await debitVoucher(customer, 30);
    assert.equal(await balanceForCustomer(customer), 70);
  });
});

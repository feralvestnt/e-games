const { createCustomer, deleteCustomer } = require('../helpers/customers');
const { balanceForCustomer, sellVoucher } = require('../helpers/vouchers');
const assert = require('node:assert/strict');

describe('Venda de voucher', () => {
  let customer;
  beforeEach(async () => { customer = await createCustomer(); });
  afterEach(async () => deleteCustomer(customer));

  it('soma o valor vendido ao saldo do cliente', async () => {
    await sellVoucher(customer, 100);
    assert.equal(await balanceForCustomer(customer), 100);
  });
});

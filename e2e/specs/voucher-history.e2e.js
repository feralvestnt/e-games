const { createCustomer, deleteCustomer } = require('../helpers/customers');
const { sellVoucher, debitVoucher } = require('../helpers/vouchers');
const assert = require('node:assert/strict');

describe('Historico de vouchers', () => {
  let customer;
  beforeEach(async () => { customer = await createCustomer(); await sellVoucher(customer, 100); await debitVoucher(customer, 30); });
  afterEach(async () => deleteCustomer(customer));

  it('mostra a venda e o debito com os valores corretos', async () => {
    await browser.url('/history');
    await $('input[placeholder="Buscar por nome ou CPF"]').setValue(customer.name);
    await browser.waitUntil(async () => (await $$('tbody tr')).length >= 2, { timeout: 15000 });
    const content = await browser.execute(() =>
      Array.from(document.querySelectorAll('tbody tr'), (row) => row.innerText)
    );
    assert.equal(content.some((text) => text.includes('Venda') && text.includes('100')), true);
    assert.equal(content.some((text) => text.includes('Debito') && text.includes('30')), true);
  });
});

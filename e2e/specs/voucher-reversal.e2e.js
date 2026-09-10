const assert = require('node:assert/strict');
const { createCustomer, deleteCustomer } = require('../helpers/customers');
const { balanceForCustomer, sellVoucher } = require('../helpers/vouchers');

const saleAmount = 100;

describe('Estorno de voucher', () => {
  let customer;

  beforeEach(async () => {
    customer = await createCustomer();
    await sellVoucher(customer, saleAmount);
  });

  afterEach(async () => {
    if (customer) await deleteCustomer(customer);
  });

  it('registra o estorno no historico apos uma venda', async () => {
    await browser.url('/reversals');

    const search = await $('input[placeholder="Nome ou CPF"]');
    await search.waitForDisplayed({ timeout: 15000 });
    await search.setValue(customer.cpf);
    await $('input[placeholder="Valor da operacao"]').setValue(String(saleAmount));
    await $('select').selectByAttribute('value', 'VENDA');

    await browser.waitUntil(async () => (await $$('tbody tr')).length === 1, {
      timeout: 15000,
      timeoutMsg: 'A venda criada nao foi localizada para estorno.',
    });

    await $('button=Estornar operacao').click();
    const reason = await $('textarea');
    await reason.setValue('Correcao automatizada de teste');
    await $('[data-testid="confirm-reversal"]').click();
    await $('[data-testid="reversal-modal"]').waitForDisplayed({ reverse: true, timeout: 15000 });

    assert.equal(await balanceForCustomer(customer), 0);

    await browser.url('/history');
    const historySearch = await $('input[placeholder="Buscar por nome ou CPF"]');
    await historySearch.setValue(customer.cpf);
    await $('select').selectByAttribute('value', 'ESTORNO');

    await browser.waitUntil(async () => {
      const rows = await $$('tbody tr');
      return rows.length === 1 && (await rows[0].getText()).includes('Estorno de venda');
    }, {
      timeout: 15000,
      timeoutMsg: 'O estorno nao foi encontrado no historico.',
    });
  });
});

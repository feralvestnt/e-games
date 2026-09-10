const { customerRow, parseCurrency } = require('./customers');

async function searchCustomerByCpf(path, customer) {
  await browser.url(path);
  const search = await $('input[placeholder="Busque por nome ou cpf"]');
  await search.waitForDisplayed({ timeout: 15000 });

  await search.click();
  await search.clearValue();
  await search.setValue(customer.cpf);

  await browser.waitUntil(async () => {
    const rows = await $$('tbody tr');
    if (rows.length !== 1) return false;
    return (await rows[0].getText()).includes(customer.cpf);
  }, {
    timeout: 15000,
    timeoutMsg: `A busca pelo CPF ${customer.cpf} nao retornou exatamente um cliente.`,
  });

  return $('tbody tr');
}

async function balanceForCustomer(customer) {
  await searchCustomerByCpf('/sellVoucher', customer);
  const row = await customerRow(customer.name);
  await row.waitForDisplayed({ timeout: 15000 });
  return parseCurrency(await row.$('td:nth-child(4)').getText());
}

async function applyVoucherOperation(path, customer, amount, actionLabel) {
  await searchCustomerByCpf(path, customer);
  const action = await $(`button=${actionLabel}`);
  await action.waitForClickable({ timeout: 15000 });
  await action.click();
  await $('input[type="number"]').setValue(String(amount));
  await $('[data-testid="confirm-voucher-operation"]').click();
  await $('[data-testid="voucher-operation-modal"]').waitForDisplayed({
    reverse: true,
    timeout: 15000,
  });
}

async function sellVoucher(customer, amount) {
  await applyVoucherOperation('/sellVoucher', customer, amount, '+ Adicionar');
}

async function debitVoucher(customer, amount) {
  await applyVoucherOperation('/debitVoucher', customer, amount, '- Debitar');
}

module.exports = {
  balanceForCustomer,
  sellVoucher,
  debitVoucher,
};

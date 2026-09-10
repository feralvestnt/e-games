let customerSequence = 0;

const makeCustomer = () => {
  const unique = String(Date.now() + customerSequence++).slice(-10).padStart(10, '0');
  return {
    name: `E2E Cliente ${unique}`,
    cpf: `9${unique}`,
    email: `e2e.${unique}@example.test`,
    phone: `119${unique.slice(-8)}`,
    address: 'Rua de Teste, 100 - Sao Paulo - SP',
  };
};

const customerRow = (name) => $(`//tr[.//td[contains(., "${name}")]]`);

async function searchCustomerInList(customer) {
  const search = await $('input[placeholder="Buscar por nome ou CPF"]');
  await search.waitForDisplayed({ timeout: 15000 });
  await search.clearValue();
  await search.setValue(customer.cpf);
  await customerRow(customer.name).waitForDisplayed({ timeout: 15000 });
}

async function createCustomer(customer = makeCustomer()) {
  await browser.url('/customers');
  await $('[data-testid="add-customer"]').click();
  await $('input[name="nome"]').setValue(customer.name);
  await $('input[name="cpf"]').setValue(customer.cpf);
  await $('input[name="email"]').setValue(customer.email);
  await $('input[name="telefone"]').setValue(customer.phone);
  await $('input[name="endereco"]').setValue(customer.address);
  await $('[data-testid="save-customer"]').click();
  await searchCustomerInList(customer);
  return customer;
}

async function deleteCustomer(customer) {
  if (!customer?.name) return;
  await browser.url('/customers');
  await searchCustomerInList(customer);
  const row = await customerRow(customer.name);
  if (!(await row.isExisting())) return;
  await row.$('button[aria-label="Excluir cliente"]').click();
  await browser.acceptAlert();
  await row.waitForExist({ reverse: true, timeout: 15000 });
}

function parseCurrency(text) {
  const value = (text.match(/[\d.,]+/) || ['0'])[0];
  if (value.includes(',') && value.includes('.')) return Number(value.replace(/\./g, '').replace(',', '.'));
  return Number(value.replace(',', '.'));
}

module.exports = { createCustomer, deleteCustomer, customerRow, parseCurrency };

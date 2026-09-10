const { createCustomer, deleteCustomer, customerRow } = require('../helpers/customers');
const assert = require('node:assert/strict');

describe('Clientes', () => {
  it('cadastra, edita e exclui um cliente', async () => {
    const customer = await createCustomer();
    const row = await customerRow(customer.name);
    await row.$('button[aria-label="Editar cliente"]').click();
    const updatedName = `${customer.name} Editado`;
    const nameInput = await $('input[name="nome"]');
    await nameInput.clearValue();
    await nameInput.setValue(updatedName);
    await $('[data-testid="save-customer"]').click();
    await customerRow(updatedName).waitForDisplayed({ timeout: 15000 });
    assert.equal(await customerRow(updatedName).isDisplayed(), true);
    await deleteCustomer({ ...customer, name: updatedName });
  });
});

# Testes E2E

As suites usam WebdriverIO e alteram dados: criam, editam e removem clientes; tambem vendem e debitam vouchers.

## Configuracao

```powershell
$env:E2E_BASE_URL = "http://localhost:3000"
```

Para testar outro ambiente, informe apenas sua URL:

```powershell
$env:E2E_BASE_URL = "https://homologacao.exemplo.com"
```

> Os testes criam, alteram e removem clientes e tambem movimentam vouchers. Use uma URL de ambiente destinado a testes.

## Execucao

```powershell
npm run e2e
```

Para abrir o navegador durante os testes:

```powershell
$env:E2E_HEADLESS = "false"
npm run e2e:headed
```

Suites por funcionalidade:

- `customers.e2e.js`: cadastro, edicao e exclusao.
- `voucher-sale.e2e.js`: soma na venda.
- `voucher-debit.e2e.js`: subtracao no debito.
- `voucher-history.e2e.js`: valores no historico.
- `existing-customer-balance.e2e.js`: saldo final no mesmo cliente criado pelo teste.

## Saldo apos operacoes

Esse teste cria um unico cliente, vende R$ 100,00, debita R$ 30,00 e confere o saldo final de R$ 70,00. O cliente e removido da lista ao final.

```powershell
npm run e2e -- --spec ./e2e/specs/existing-customer-balance.e2e.js
```

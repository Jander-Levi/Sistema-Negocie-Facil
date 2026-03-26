# Manual do Usuário - Sistema de Negociação de Débitos

## 1. Introdução
Este documento serve como guia de utilização do **Sistema de Negociação de Débitos**. Ele detalha os recursos disponíveis e o fluxo de operação do sistema, abrangendo a visão do cliente (Portal Público) e a visão da equipe de atendimento (Painel de Controle).

> **Nota:** Por questões de segurança, este manual não contém links de acesso, senhas ou credenciais administrativas.

---

## 2. Portal do Cliente (Área Pública)
Este é o ambiente voltado para o cliente final, onde ele pode consultar de forma autônoma suas pendências e simular propostas de acordo.

### 2.1. Consulta de Pendências
- O cliente precisará inserir seus dados de identificação (geralmente CPF e Data de Nascimento) para consultar seus débitos.
- Após enviar os dados, o sistema listará todos os débitos em aberto vinculados àquele registro.
- O sistema exibe o **Valor Original** do débito e, em caso de atraso, o **Valor Atualizado**.
- **Regra de Atualização:** O valor atualizado é calculado automaticamente pelo sistema. A regra padrão aplica uma multa de 2% sobre o valor original e juros de 1% ao mês, calculados proporcionalmente aos dias exatos de atraso.

### 2.2. Simulação e Fechamento de Acordo
- O cliente pode verificar as opções de pagamento disponíveis para a sua dívida.
- O sistema gerará opções de parcelamento dinâmicas (ex.: pagamento à vista com isenção de multas/juros, ou parcelamento em até 6x com taxas variáveis).
- Após escolher a melhor condição, o cliente seleciona sua forma de pagamento preferida.
- **Aviso de Emissão:** Ao confirmar a negociação, o cliente receberá um aviso confirmando o fechamento do acordo e informando que a fatura/boleto para pagamento estará disponível na plataforma em até 30 minutos ou será encaminhada via WhatsApp.

---

## 3. Painel Administrativo (Área do Operador)
Ambiente restrito destinado à equipe interna de negociação e administração do sistema, focado em gerenciar a base de dados e acompanhar o andamento dos acordos.

### 3.1. Dashboard e Visão Geral
- Tela inicial que apresenta o resumo das operações, permitindo ao operador ter uma visão rápida de quantos acordos estão em andamento ou finalizados.

### 3.2. Gerenciamento de Clientes
- **Cadastro e Edição:** Permite registrar um novo cliente na base, atualizando dados de contato como telefone e informações de validação.
- **Exclusão:** Os operadores têm a opção de remover clientes da base. 
  - *Importante:* Ao excluir um cliente, o sistema automaticamente apaga todos os débitos e o histórico de negociações atrelados a ele, garantindo a organização e integridade dos dados na plataforma.

### 3.3. Lançamento e Gestão de Débitos
- Nesta seção, o operador visualiza todas as dívidas cadastradas de todos os clientes.
- Ao cadastrar um novo débito para um cliente, o operador informa a descrição, o valor original e a data de vencimento prevista. O cálculo de atrasos é gerenciado diretamente pela plataforma assim que o prazo vence.

### 3.4. Acompanhamento de Soluções e Acordos
- Quando um cliente efetua um acordo no portal público, a solicitação cai nessa tela para o acompanhamento do atendente.
- Na lista de solicitações, o operador tem acesso ao valor negociado final, a quantidade de parcelas e a **Forma de Pagamento** que foi escolhida pelo cliente no ato de fechamento na área pública.

### 3.5. Histórico e Logs de Sistema
- A plataforma conta com um sistema de rastreabilidade (Logs) que registra ações importantes de forma oculta ou visível para auditoria. Ações como exclusão de usuários, consultas e geração de acordos são registradas para maior segurança da operação.

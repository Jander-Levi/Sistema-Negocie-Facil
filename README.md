# Manual do Usuário - Sistema de Negociação de Débitos

## 1. Introdução
Este documento serve como guia de utilização do **Sistema de Negociação de Débitos**. Ele detalha os recursos disponíveis e o fluxo de operação do sistema, abrangendo a visão do cliente (Portal Público) e a visão da equipe de atendimento (Painel de Controle).

> **Nota:** Por questões de segurança, este manual não contém links de acesso, senhas ou credenciais administrativas.

---

## 2. Portal do Cliente (Área Pública)
Este é o ambiente voltado para o cliente final, onde ele pode consultar de forma autônoma suas pendências e simular propostas de acordo. A plataforma obedece a uma identidade visual profissional (ex.: logo G2G e favicon).

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
Ambiente restrito destinado à equipe interna de negociação e administração do sistema, focado em gerenciar a base de dados, acompanhar o andamento dos acordos e medir a proatividade da equipe.

### 3.1. Dashboard de Produtividade e Desempenho
- **Visão Geral:** Tela inicial que apresenta o resumo das operações, permitindo ao operador ou gestor ter uma visão rápida de métricas gerais e individuais.
- **Ranking de Colaboradores:** Exibe o desempenho da equipe, ranqueando os operadores com base no número de acordos formalizados e clientes atendidos, incentivando a produtividade.
- **Métricas Individuais:** O operador logado consegue visualizar sua própria performance, quantidade de atendimentos recentes e histórico de ações.

### 3.2. Gerenciamento de Clientes (Dossiê Digital)
- **Cadastro e Edição:** Permite registrar um novo cliente na base, atualizando dados de contato como telefone e informações essenciais.
- **Dossiê do Cliente (Visão 360º):** O perfil do cliente atua como um dossiê digital completo. A partir da ficha (detalhe) do cliente, é possível ver de forma centralizada todos os seus débitos atrelados, os acordos firmados e todos os logs de ações (histórico de contato e alterações) específicos daquele consumidor.
- **Exclusão:** Os operadores têm a opção de remover clientes da base. 
  - *Importante:* Ao excluir um cliente, o sistema automaticamente apaga todos os débitos e o histórico de negociações atrelados a ele, garantindo a organização e a integridade dos dados na plataforma.

### 3.3. Lançamento e Gestão de Débitos
- Nesta seção, o operador visualiza e cria as dívidas para associá-las a um cliente específico.
- Ao cadastrar um novo débito, o operador informa a descrição, o valor original e a data de vencimento prevista. O cálculo da evolução da dívida (juros e mora) passa a ser gerenciado automaticamente.

### 3.4. Gestão de Acordos e Validações
- Quando um cliente efetua um acordo no portal público, a solicitação entra na área de controle para acompanhamento.
- A plataforma exibe o valor negociado final, a quantidade de parcelas e a **Forma de Pagamento** escolhida pelo usuário.
- **Anexo de Documentações (Upload):** O operador conta com o recurso de adicionar em anexo arquivos com extensões comuns, ideal para salvar boletos emitidos ou salvar recibos e comprovantes de pagamento de clientes.
- **Edição e Validação:** A interface administrativa possui fluxos robustos que permitem alterar ou atualizar o status de acordos (Aguardando Pagamento, Pago, Cancelado, Quebra de Acordo) e validar as tratativas.

### 3.5. Histórico e Logs de Sistema Avançados
- A plataforma conta com um sistema de rastreabilidade (Logs) que registra ações importantes de forma detalhada e auditável.
- **Atribuição de Autoria:** Todas as ações estratégicas (como inclusão de cliente, remoção de débitos ou alteração manual de acordos) são estritamente vinculadas e logadas constando a autoria do operador que realizou a operação, garantindo total transparência, controle de qualidade e responsabilização na plataforma.

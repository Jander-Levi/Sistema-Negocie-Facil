// ==========================================
// INÍCIO DA ÁREA EDITÁVEL
// CONFIGURAÇÃO MANUAL DE DADOS DO SISTEMA
// Este arquivo simula um banco de dados e contém 
// as regras e informações que alimentam o site.
// Edite os valores abaixo com cuidado.
// ==========================================

const AppData = {
    // Lista de usuários administrativos
    usuarios: [
        { id: 1, nome: "Admin Master", email: "admin@empresa.com", senha: "admin", perfil: "administrador" },
        { id: 2, nome: "João Atendimento", email: "joao@empresa.com", senha: "123", perfil: "atendente" }
    ],

    // Lista de clientes
    clientes: [
        { 
            id: 1, 
            cpf: "172.490.146-09", 
            nome: "Levi", 
            telefone: "(11) 98888-7777",
            dadoValidacao: "00/00/0000" // Data de nascimento, por exemplo
        },
        { 
            id: 2, 
            cpf: "222.222.222-22", 
            nome: "Carlos Eduardo Costa", 
            telefone: "(21) 97777-6666",
            dadoValidacao: "15/12/1992" 
        }
    ],

    // Lista de débitos pendentes dos clientes
    debitos: [
        { id: 101, clienteId: 1, descricao: "Fatura Atrasada - Jan/2026", valorOriginal: 150.00, valorAtualizado: 185.50, vencimentoOriginal: "2026-01-10", status: "aberto" },
        { id: 102, clienteId: 1, descricao: "Fatura Atrasada - Fev/2026", valorOriginal: 150.00, valorAtualizado: 170.00, vencimentoOriginal: "2026-02-10", status: "aberto" },
        { id: 103, clienteId: 2, descricao: "Renegociação Quebrada - 2025", valorOriginal: 850.00, valorAtualizado: 1200.00, vencimentoOriginal: "2025-11-05", status: "aberto" }
    ],

    // Configuração Manual: REGRA DE NEGOCIAÇÃO
    // Opções de parcelamento possíveis baseadas no valor total
    condicoesNegociacao: [
        { id: 1, parcelas: 1, jurosAoMes: 0, descricao: "À vista" },
        { id: 2, parcelas: 3, jurosAoMes: 0.0, descricao: "Em 3x sem juros" },
        { id: 3, parcelas: 6, jurosAoMes: 1.5, descricao: "Em 6x com juros de 1.5% a.m." }
    ],

    // Lista vazia inicial de solicitações feitas (Negociações abertas pelo cliente)
    // O sistema irá preencher isto dinamicamente e salvar em LocalStorage
    solicitacoes: [],

    // Lista de Histórico e Logs de Ações (Fase 2)
    logs: [],

    // FIM DA ÁREA EDITÁVEL
    // ==========================================

    /* 
     * MÉTODOS DE INICIALIZAÇÃO E UTILIDADE (NÃO ALTERAR)
     * Funções para simular um banco de dados real salvando
     * tudo no cache do navegador (LocalStorage).
     */
    init: function() {
        if (!localStorage.getItem('AppData_usuarios')) {
            localStorage.setItem('AppData_usuarios', JSON.stringify(this.usuarios));
            localStorage.setItem('AppData_clientes', JSON.stringify(this.clientes));
            localStorage.setItem('AppData_debitos', JSON.stringify(this.debitos));
            localStorage.setItem('AppData_condicoes', JSON.stringify(this.condicoesNegociacao));
            localStorage.setItem('AppData_solicitacoes', JSON.stringify(this.solicitacoes));
            localStorage.setItem('AppData_logs', JSON.stringify(this.logs));
        }
    },

    get: function(tabela) {
        let dados = JSON.parse(localStorage.getItem('AppData_' + tabela)) || [];
        if (tabela === 'debitos') {
            dados = dados.map(d => {
                if(d.status === 'aberto' || d.status === 'em_negociacao') {
                    d.valorAtualizado = this.calcularValorAtualizado(d.valorOriginal, d.vencimentoOriginal);
                }
                return d;
            });
        }
        return dados;
    },

    calcularValorAtualizado: function(valorOriginal, vencimentoOriginal) {
        const hoje = new Date();
        const venc = new Date(vencimentoOriginal);
        // Reseta as horas para comparar apenas datas
        hoje.setHours(0,0,0,0);
        venc.setHours(0,0,0,0);

        if (venc >= hoje) return valorOriginal;
        
        const diffTime = hoje.getTime() - venc.getTime();
        const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const multa = valorOriginal * 0.02; // Multa de 2%
        const jurosPorDia = (0.01 / 30); // 1% ao mês / 30 dias
        const juros = valorOriginal * jurosPorDia * diasAtraso;
        
        return valorOriginal + multa + juros;
    },

    set: function(tabela, dados) {
        localStorage.setItem('AppData_' + tabela, JSON.stringify(dados));
    },

    logAction: function(usuario, tipoAcao, detalhes, cpf = null) {
        const _logs = this.get('logs');
        const novoLog = {
            id: Date.now(),
            dataHora: new Date().toISOString(),
            usuario: usuario,
            tipoAcao: tipoAcao, // 'LOGIN', 'CONSULTA_CPF', 'CRIACAO_BOLETO', 'EDICAO_USUARIO'
            detalhes: detalhes,
            cpfRelacionado: cpf
        };
        _logs.push(novoLog);
        this.set('logs', _logs);
    },

    clear: function() {
        localStorage.clear();
        this.init();
    },

    deleteCliente: function(id) {
        const clientes = this.get('clientes');
        const novosClientes = clientes.filter(c => c.id === id ? false : true); // ou apenas c.id !== id
        
        if (clientes.length !== novosClientes.length) {
            // Atualiza a lista de clientes
            this.set('clientes', novosClientes);
            
            // Remove os débitos vinculados ao cliente
            const debitos = this.get('debitos');
            const novosDebitos = debitos.filter(d => d.clienteId !== id);
            this.set('debitos', novosDebitos);
            
            // Remove as solicitações vinculadas ao cliente
            const solicitacoes = this.get('solicitacoes');
            if (solicitacoes) {
                const novasSolicitacoes = solicitacoes.filter(s => s.clienteId !== id);
                this.set('solicitacoes', novasSolicitacoes);
            }
            
            this.logAction('Sistema', 'EXCLUSAO_CLIENTE', `Cliente ID ${id} e seus débitos/solicitações foram removidos.`);
            return true;
        }
        return false;
    }
};

// Inicializa a persistência local ao carregar o arquivo
AppData.init();

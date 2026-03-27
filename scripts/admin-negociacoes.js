// ==========================================
// SCRIPTS DA ÁREA DE GESTÃO DE NEGOCIAÇÕES (O Centro de Comando)
// Aqui é onde o atendente vê os pedidos dos clientes e aprova os pagamentos.
// ==========================================

// Novamente, aguarda a página carregar tudo antes de deixar o código agir.
document.addEventListener("DOMContentLoaded", () => {
    
    if(!window.location.pathname.includes('negociacoes.html')) return;

    const tblBody = document.getElementById('tblNegociacoesBody');
    const modal = document.getElementById('modalBoleto');
    const modalEditar = document.getElementById('modalEditarSolicitacao');
    let solicitacaoAtual = null;

    // Função principal que lê as negociações pendentes no banco de dados e desenha elas na tabela
    function carregarTabela() {
        const solicitacoes = AppData.get('solicitacoes'); // Pega todas solicitações de acordos
        const clientes = AppData.get('clientes');         // Pega os perfis dos clientes para saber o nome deles
        
        tblBody.innerHTML = ''; // Limpa a tabela para não ficar duplicando as coisas velhas

        if(solicitacoes.length === 0) {
            tblBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Não há solicitações de boletos neste momento.</td></tr>';
            return;
        }

        // Ordena para mostrar as mais novas primeiro ('sort' bagunça e arruma a lista baseada na data)
        // E logo em seguida embala td num 'forEach' (para processar um por um):
        solicitacoes.sort((a,b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao)).forEach(solic => {
            const cliente = clientes.find(c => c.id === solic.clienteId);
            const nomeCliente = cliente ? cliente.nome : 'Desconhecido';
            const dataFormatada = new Date(solic.dataSolicitacao).toLocaleDateString('pt-BR');
            
            let badgeClass = 'badge-warning';
            let statusTexto = 'Aguardando Boleto';
            let acaoHTML = `<button class="btn btn-gerar-boleto" data-id="${solic.id}" style="padding: 5px 10px; font-size: 0.8rem;">Gerar Boleto</button>`;

            if(solic.status === 'boleto_enviado') {
                badgeClass = 'badge-success';
                statusTexto = 'Boleto Enviado';
                acaoHTML = `<span style="color: #64748b; font-size:0.8rem;">Concluído</span>`;
            } else if(solic.status === 'comprovante_enviado') {
                badgeClass = 'badge-info';
                statusTexto = 'Análise Pgto';
                acaoHTML = `<a href="${solic.arquivoComprovante}" download="Comprovante_${solic.id}" class="btn" style="padding: 5px 10px; font-size: 0.8rem; text-decoration:none; display:inline-block; margin-top:5px; background:#3b82f6;">Ver Comprovante</a>`;
            } else if(solic.status === 'pago') {
                badgeClass = 'badge-success';
                statusTexto = 'Pago / Fechado';
                acaoHTML = `<span style="color: #64748b; font-size:0.8rem;">Acordo Finalizado</span>`;
            } else if(solic.status === 'cancelado') {
                badgeClass = 'badge-danger';
                statusTexto = 'Cancelado';
                acaoHTML = `<span style="color: #64748b; font-size:0.8rem;">-</span>`;
            }

            let botaoEditar = `<div style="margin-top: 5px;"><button class="btn btn-outline btn-editar-solicitacao" data-id="${solic.id}" style="padding: 5px 10px; font-size: 0.8rem;">Editar</button></div>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada} \n<small>#${solic.id}</small></td>
                <td><strong>${nomeCliente}</strong></td>
                <td>${solic.formaPagamento || '-'}</td>
                <td>R$ ${solic.valorTotalAcordo.toFixed(2).replace('.', ',')}</td>
                <td><span class="badge ${badgeClass}">${statusTexto}</span></td>
                <td>${acaoHTML} ${botaoEditar}</td>
            `;
            tblBody.appendChild(tr);
        });

        // Adiciona evento aos botões para abrir a tela de gerar boleto
        document.querySelectorAll('.btn-gerar-boleto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                abrirModalBoleto(id);
            });
        });

        // Adiciona evento aos botões para abrir a tela de edição
        document.querySelectorAll('.btn-editar-solicitacao').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                abrirModalEditarSolicitacao(id);
            });
        });
    }

    // Essa função é o "Abrir Janelinha". Mostra um pop-up (Modal) por cima da tela pra gerar o código de barra
    function abrirModalBoleto(id) {
        solicitacaoAtual = id; // "Memória de Mosquito": O atendente está focando NESSA id de boleto no momento
        document.getElementById('lblSolicitacaoId').innerText = "#" + id; // Desenha o número ID lá na lousa visual (HTML)
        document.getElementById('txtLinhaDigitavel').value = '';
        document.getElementById('txtObservacao').value = '';
        document.getElementById('txtMensagemCliente').value = '';
        if (document.getElementById('arquivoBoleto')) document.getElementById('arquivoBoleto').value = '';
        modal.style.display = 'flex';
    }

    function fecharModal() {
        modal.style.display = 'none';
        solicitacaoAtual = null;
    }

    document.getElementById('btnCancelarBoleto').addEventListener('click', fecharModal);

    document.getElementById('btnSalvarBoleto').addEventListener('click', async () => {
        const linha = document.getElementById('txtLinhaDigitavel').value.trim();
        const obs = document.getElementById('txtObservacao').value.trim();
        const msgCliente = document.getElementById('txtMensagemCliente').value.trim();
        const fileInput = document.getElementById('arquivoBoleto');
        let arquivoBase64 = null;

        if(!linha) {
            alert('A linha digitável do boleto é obrigatória para finalizar.');
            return;
        }

        if(fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            arquivoBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }

        // REGRA DE ACESSO: Salvando de fato a alteração no "banco simulado" (LocalStorage)
        const solicitacoes = AppData.get('solicitacoes');
        // Acha a "gavetinha" exata na lista (index) que é a ficha desse cliente:
        const index = solicitacoes.findIndex(s => s.id === solicitacaoAtual);

        if(index > -1) { // Se index é maior que -1, significa que ele realmente achou a pessoa:
            // Escreve lá na ficha do cidadão avisando que o funcionário mandou o maldito boleto:
            solicitacoes[index].status = 'boleto_enviado';
            solicitacoes[index].linhaDigitavel = linha;
            solicitacoes[index].observacao = obs;
            solicitacoes[index].mensagemCliente = msgCliente;
            solicitacoes[index].dataEnvio = new Date().toISOString(); // Pega a hora+data exata do clique do atendente
            if (arquivoBase64) {
                solicitacoes[index].arquivoBoleto = arquivoBase64;
            }
            
            // Guarda a lista inteira atualizada de volta na gaveta (LocalStorage):
            AppData.set('solicitacoes', solicitacoes);
            
            alert('Parabéns! Boleto marcado como enviado para o cliente.');
            fecharModal();
            // Dá um "f5" interno chamando a tabela pra ela redesenhar e ficar com a plaquinha verde
            carregarTabela();
        }
    });

    function abrirModalEditarSolicitacao(id) {
        solicitacaoAtual = id;
        const solicitacoes = AppData.get('solicitacoes');
        const solic = solicitacoes.find(s => s.id === id);
        
        if(solic) {
            document.getElementById('lblEditSolicitacaoId').innerText = "#" + id;
            document.getElementById('editStatus').value = solic.status || 'pendente_boleto';
            document.getElementById('editValorTotal').value = solic.valorTotalAcordo || 0;
            document.getElementById('editFormaPagamento').value = solic.formaPagamento || '';
            document.getElementById('editObservacao').value = solic.observacao || '';
            document.getElementById('editMensagemCliente').value = solic.mensagemCliente || '';
            
            modalEditar.style.display = 'flex';
        }
    }

    function fecharModalEditarSolicitacao() {
        modalEditar.style.display = 'none';
        solicitacaoAtual = null;
    }

    document.getElementById('btnCancelarEdicaoSolicitacao').addEventListener('click', fecharModalEditarSolicitacao);

    document.getElementById('btnSalvarEdicaoSolicitacao').addEventListener('click', () => {
        const solicitacoes = AppData.get('solicitacoes');
        const index = solicitacoes.findIndex(s => s.id === solicitacaoAtual);
        
        if(index > -1) {
            solicitacoes[index].status = document.getElementById('editStatus').value;
            solicitacoes[index].valorTotalAcordo = parseFloat(document.getElementById('editValorTotal').value);
            solicitacoes[index].formaPagamento = document.getElementById('editFormaPagamento').value.trim();
            solicitacoes[index].observacao = document.getElementById('editObservacao').value.trim();
            solicitacoes[index].mensagemCliente = document.getElementById('editMensagemCliente').value.trim();
            
            AppData.set('solicitacoes', solicitacoes);
            alert('Solicitação atualizada com sucesso!');
            fecharModalEditarSolicitacao();
            carregarTabela();
        }
    });

    carregarTabela();
});

// ==========================================
// SCRIPTS DA ÁREA DO CLIENTE
// Contém a lógica de interface usada pelo cliente
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // MÁSCARAS DE ENTRADA DO CLIENTE
    // ==========================================
    const inputCpf = document.getElementById('cpf');
    const inputData = document.getElementById('dadoValidacao');

    if (inputCpf) {
        inputCpf.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
            if (valor.length > 11) valor = valor.slice(0, 11); // Limita a 11 números

            // Aplica a máscara de CPF: 000.000.000-00
            if (valor.length > 9) {
                valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            } else if (valor.length > 6) {
                valor = valor.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
            } else if (valor.length > 3) {
                valor = valor.replace(/(\d{3})(\d+)/, "$1.$2");
            }
            e.target.value = valor;
        });
    }

    if (inputData) {
        inputData.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
            if (valor.length > 8) valor = valor.slice(0, 8); // Limita a 8 números

            // Aplica a máscara de Data: 00/00/0000
            if (valor.length > 4) {
                valor = valor.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
            } else if (valor.length > 2) {
                valor = valor.replace(/(\d{2})(\d+)/, "$1/$2");
            }
            e.target.value = valor;
        });
    }

    // ==========================================
    // 1. TELA DE CONSULTA DE CPF
    // ==========================================
    const formConsulta = document.getElementById('formConsulta');
    if (formConsulta) {
        formConsulta.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita recarregar a página
            
            const cpfDigitado = document.getElementById('cpf').value.trim();
            const dadoDigitado = document.getElementById('dadoValidacao').value.trim();
            const erroMsg = document.getElementById('erroMsg');
            
            // Busca o cliente no "banco de dados" simulado
            const clientes = AppData.get('clientes');
            const clienteEncontrado = clientes.find(c => c.cpf === cpfDigitado && c.dadoValidacao === dadoDigitado);

            // REGISTRO AUTOMÁTICO DE CONSULTA DO CLIENTE
            AppData.logAction("Sistema (Cliente Externo)", "CONSULTA_CPF", `Tentativa de consulta via Front. Status: ${clienteEncontrado ? 'Sucesso' : 'Falha'}. CPF mascarado: ***.${cpfDigitado.substring(4,7)}.${cpfDigitado.substring(8,11)}-**`, cpfDigitado);

            if (clienteEncontrado) {
                // Salva o ID do cliente logado temporariamente (Sessão do navegador)
                sessionStorage.setItem('clienteLogadoId', clienteEncontrado.id);
                // Redireciona para a página com a lista de débitos
                window.location.href = 'resultado.html';
            } else {
                // Exibe mensagem de erro caso os dados não batam
                erroMsg.style.display = 'block';
                // CONFIGURAÇÃO MANUAL - TEXTO EXIBIDO NO ERRO
                erroMsg.innerText = "Dados não encontrados ou incorretos. Verifique e tente novamente.";
            }
        });
    }

    // ==========================================
    // 2. TELA DE RESULTADOS (LISTA DE DÉBITOS)
    // ==========================================
    window.UIResultados = {
        init: function() {
            const clienteId = sessionStorage.getItem('clienteLogadoId');
            if(!clienteId) {
                window.location.href = '../index.html';
                return;
            }

            const clientes = AppData.get('clientes');
            const cliente = clientes.find(c => c.id == clienteId);
            if(cliente) {
                document.getElementById('nomeCliente').innerText = cliente.nome;
            }

            this.carregarDebitos(clienteId);
            this.carregarAcordos(clienteId);

            document.getElementById('btnAvancarNegociacao').addEventListener('click', () => {
                this.avancarNegociacao();
            });

            document.getElementById('btnSair')?.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('clienteLogadoId');
                window.location.href = '../index.html';
            });
        },

        carregarDebitos: function(clienteId) {
            const todosDebitos = AppData.get('debitos');
            const meusDebitos = todosDebitos.filter(d => d.clienteId == clienteId && d.status === 'aberto');
            const tbody = document.getElementById('tabelaDebitosBody');
            tbody.innerHTML = '';

            if(meusDebitos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Não há débitos em aberto.</td></tr>';
                return;
            }

            meusDebitos.forEach(debito => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="chk-debito" value="${debito.id}" data-valor="${debito.valorAtualizado}"></td>
                    <td>${debito.descricao}</td>
                    <td>${debito.vencimentoOriginal.split('-').reverse().join('/')}</td>
                    <td>R$ ${debito.valorOriginal.toFixed(2).replace('.', ',')}</td>
                    <td style="color: var(--cor-principal); font-weight: bold;">R$ ${debito.valorAtualizado.toFixed(2).replace('.', ',')}</td>
                `;
                tbody.appendChild(tr);
            });

            const checkboxes = document.querySelectorAll('.chk-debito');
            checkboxes.forEach(chk => chk.addEventListener('change', () => this.calcularTotal()));
        },

        carregarAcordos: function(clienteId) {
            const solicitacoes = AppData.get('solicitacoes');
            const meusAcordos = solicitacoes.filter(s => s.clienteId == clienteId);
            
            const secao = document.getElementById('secaoAcordos');
            const tbody = document.getElementById('tabelaAcordosBody');
            
            if(!secao || !tbody) return;

            if(meusAcordos.length === 0) {
                secao.style.display = 'none';
                return;
            }

            secao.style.display = 'block';
            tbody.innerHTML = '';

            meusAcordos.forEach(acordo => {
                const tr = document.createElement('tr');
                const dataFormatada = new Date(acordo.dataSolicitacao).toLocaleDateString('pt-BR');
                
                let statusBadge = '';
                let acaoHtml = '';
                
                if (acordo.status === 'pendente_boleto') {
                    statusBadge = '<span style="color: #eab308; font-weight: bold;">Em Análise</span>';
                    acaoHtml = 'Aguardando liberação';
                } else if (acordo.status === 'boleto_enviado') {
                    statusBadge = '<span style="color: #22c55e; font-weight: bold;">Pagamento Pendente</span>';
                    acaoHtml = `
                        <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem; margin-bottom:5px;" onclick="navigator.clipboard.writeText('${acordo.linhaDigitavel}'); alert('Linha digitável copiada!')">Copiar Código</button>
                    `;
                    if (acordo.arquivoBoleto) {
                        acaoHtml += `<br><a href="${acordo.arquivoBoleto}" download="Boleto_${acordo.id}.pdf" class="btn" style="padding: 5px 10px; font-size: 0.8rem; margin-bottom:5px; display: inline-block;">Baixar Boleto</a>`;
                    }
                    acaoHtml += `<br>
                        <input type="file" id="comprovante_${acordo.id}" style="display:none;" accept="image/*,.pdf" onchange="UIResultados.enviarComprovante(${acordo.id}, this)">
                        <button class="btn" onclick="document.getElementById('comprovante_${acordo.id}').click()" style="padding: 5px 10px; font-size: 0.8rem; margin-bottom:5px;">Anexar Comprovante</button>
                    `;
                } else if(acordo.status === 'comprovante_enviado') {
                    statusBadge = '<span style="color: #3b82f6; font-weight: bold;">Em Validação</span>';
                    acaoHtml = '<span style="font-size:0.8rem;">Aguardando equipe.</span>';
                } else if(acordo.status === 'pago' || acordo.status === 'concluido') {
                    statusBadge = '<span style="color: #22c55e; font-weight: bold;">Pago / Concluído</span>';
                    acaoHtml = '<span style="font-size:0.8rem;">Acordo Finalizado.</span>';
                } else {
                    statusBadge = `<span>${acordo.status}</span>`;
                }

                acaoHtml += `<br><a href="acordo.html?id=${acordo.id}" target="_blank" class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem; display: inline-block;">Ver Termo</a>`;

                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${statusBadge}</td>
                    <td>R$ ${acordo.valorTotalAcordo.toFixed(2).replace('.', ',')}</td>
                    <td>${acordo.formaPagamento || '-'}</td>
                    <td>${acaoHtml}</td>
                `;
                tbody.appendChild(tr);
            });
        },

        enviarComprovante: async function(acordoId, fileInput) {
            if(fileInput.files.length === 0) return;
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            const arquivoBase64 = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            const solicitacoes = AppData.get('solicitacoes');
            const index = solicitacoes.findIndex(s => s.id === acordoId);
            if(index > -1) {
                solicitacoes[index].arquivoComprovante = arquivoBase64;
                solicitacoes[index].status = 'comprovante_enviado';
                AppData.set('solicitacoes', solicitacoes);
                alert("Comprovante enviado com sucesso! Aguarde a validação da equipe.");
                this.carregarAcordos(sessionStorage.getItem('clienteLogadoId'));
            }
        },

        calcularTotal: function() {
            let total = 0;
            const checkboxes = document.querySelectorAll('.chk-debito:checked');
            checkboxes.forEach(chk => {
                total += parseFloat(chk.dataset.valor);
            });

            document.getElementById('totalSelecionado').innerText = total.toFixed(2).replace('.', ',');
            
            const btnAvancar = document.getElementById('btnAvancarNegociacao');
            if(total > 0) {
                btnAvancar.style.display = 'inline-block';
            } else {
                btnAvancar.style.display = 'none';
            }
        },

        avancarNegociacao: function() {
            const checkboxes = document.querySelectorAll('.chk-debito:checked');
            const debitosSelecionados = Array.from(checkboxes).map(chk => parseInt(chk.value));
            
            sessionStorage.setItem('debitosSelecionados', JSON.stringify(debitosSelecionados));
            window.location.href = 'negociacao.html';
        }
    };

    // ==========================================
    // 3. TELA DE NEGOCIAÇÃO E PARCELAMENTO
    // ==========================================
    window.UINegociacao = {
        init: function() {
            const clienteId = sessionStorage.getItem('clienteLogadoId');
            const selecionados = JSON.parse(sessionStorage.getItem('debitosSelecionados') || '[]');
            
            if(!clienteId || selecionados.length === 0) {
                window.location.href = 'resultado.html';
                return;
            }

            document.getElementById('btnSair')?.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('clienteLogadoId');
                window.location.href = '../index.html';
            });

            this.gerarOpcoes(selecionados);

            document.getElementById('btnConfirmarAcordo').addEventListener('click', () => {
                this.solicitarAcordo(clienteId, selecionados);
            });
        },

        gerarOpcoes: function(selecionados) {
            const debitosCarga = AppData.get('debitos');
            let totalDevido = 0;
            
            const listaContainer = document.getElementById('listaDebitosNegociacao');
            if (listaContainer) listaContainer.innerHTML = '';

            selecionados.forEach(id => {
                const d = debitosCarga.find(x => x.id === id);
                if(d) {
                    totalDevido += d.valorAtualizado;
                    if(listaContainer) {
                        const li = document.createElement('li');
                        li.style.padding = '8px 0';
                        li.style.borderBottom = '1px dashed #cbd5e1';
                        li.innerHTML = `<strong>${d.descricao}</strong> <span style="float: right; color: var(--cor-principal); font-weight: bold;">R$ ${d.valorAtualizado.toFixed(2).replace('.', ',')}</span> <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Vencimento: ${d.vencimentoOriginal.split('-').reverse().join('/')}</div>`;
                        listaContainer.appendChild(li);
                    }
                }
            });

            document.getElementById('totalNegociar').innerText = totalDevido.toFixed(2).replace('.', ',');

            const condicoes = AppData.get('condicoes');
            const container = document.getElementById('opcoesNegociacao');
            container.innerHTML = '';

            // REGRA DE NEGOCIAÇÃO MANUAL
            condicoes.forEach(cond => {
                let valorFinal = totalDevido;
                
                let valorComJuros = cond.jurosAoMes > 0 ? valorFinal * Math.pow(1 + cond.jurosAoMes/100, cond.parcelas) : valorFinal;
                let valorParcela = valorComJuros / cond.parcelas;

                const card = document.createElement('div');
                card.className = 'card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <h3>${cond.descricao}</h3>
                    <p style="font-size: 1.5rem; margin: 15px 0;"><strong>${cond.parcelas}x de R$ ${valorParcela.toFixed(2).replace('.', ',')}</strong></p>
                    <p style="font-size: 0.9rem; color: #666;">Total a pagar: R$ ${valorComJuros.toFixed(2).replace('.', ',')}</p>
                    <button class="btn btn-outline" style="margin-top: 15px; width: 100%; border-color: var(--cor-principal); color: var(--cor-principal);">Selecionar Opção</button>
                `;

                card.addEventListener('click', () => {
                    document.querySelectorAll('#opcoesNegociacao .card').forEach(c => c.style.border = 'none');
                    card.style.border = '2px solid var(--cor-secundaria)';
                    
                    document.getElementById('divConfirmacao').style.display = 'block';
                    document.getElementById('escolhaTexto').innerText = cond.descricao + " (Total: R$ "+valorComJuros.toFixed(2).replace('.', ',')+")";

                    sessionStorage.setItem('opcaoSelecionada', JSON.stringify({
                        condicaoId: cond.id,
                        valorTotal: valorComJuros,
                        valorParcela: valorParcela,
                        parcelas: cond.parcelas
                    }));

                    // Seleciona o elemento de escolher a forma de pagamento (Select box)
                    const selectFormaPagamento = document.getElementById('formaPagamento');
                    
                    if (selectFormaPagamento) {
                        // Converte as opções do Select em um Array e passa por cada uma delas
                        Array.from(selectFormaPagamento.options).forEach(opt => {
                            // Regra para Boleto Bancário
                            if (opt.value === 'Boleto') {
                                // Se a quantidade de parcelas for maior que 1, então o pagamento não é à vista
                                if (cond.parcelas > 1) {
                                    opt.disabled = true; // Desabilita a opção na lista do HTML
                                    opt.text = "Boleto Bancário (Apenas à vista)"; // Muda o texto que aparece na tela
                                    
                                    // Se o boleto já estivesse selecionado, muda a seleção para vazio de forma forçada
                                    if (selectFormaPagamento.value === 'Boleto') {
                                        selectFormaPagamento.value = '';
                                    }
                                } else {
                                    // Pagamento à vista (cond.parcelas === 1) -> Habilita de volta o Boleto
                                    opt.disabled = false;
                                    opt.text = "Boleto Bancário";
                                }
                            // Regra para PIX (mesma lógica do Boleto, não pode parcelar)
                            } else if (opt.value === 'Pix') {
                                if (cond.parcelas > 1) {
                                    opt.disabled = true;
                                    opt.text = "PIX (Apenas à vista)";
                                    if (selectFormaPagamento.value === 'Pix') {
                                        selectFormaPagamento.value = '';
                                    }
                                } else {
                                    opt.disabled = false;
                                    opt.text = "PIX";
                                }
                            }
                        });
                    }
                });

                container.appendChild(card);
            });
        },

        solicitarAcordo: function(clienteId, selecionadosIds) {
            const opcao = JSON.parse(sessionStorage.getItem('opcaoSelecionada'));
            const formaPgto = document.getElementById('formaPagamento').value;
            
            if(!opcao) {
                alert("Por favor, selecione uma opção de negociação.");
                return;
            }
            if(!formaPgto) {
                alert("Por favor, selecione uma forma de pagamento.");
                return;
            }

            // Validação de Segurança Backend: Garante que o usuário não burlou o campo desativado no HTML e clicou em enviar
            // Bloqueia a solicitação se a forma for "Boleto" ou "Pix" E o número de parcelas for maior que 1.
            if((formaPgto === 'Boleto' || formaPgto === 'Pix') && opcao.parcelas > 1) {
                // Descobre a forma em texto para exibir pro usuário no alerta
                const nomeForma = formaPgto === 'Boleto' ? 'Boleto Bancário' : 'PIX';
                
                // Mostra um aviso explicativo na tela e aborta o "solicitarAcordo" usando o 'return'
                alert(`O pagamento via ${nomeForma} está disponível apenas para pagamentos à vista (1x). Por favor, informe Cartão de Crédito para pagamentos parcelados ou altere a opção de parcelamento.`);
                return;
            }

            // SIMULANDO A GRAVAÇÃO DA SOLICITAÇÃO NO BANCO
            const solicitacoes = AppData.get('solicitacoes');
            const debitos = AppData.get('debitos');
            
            const novaSolicitacao = {
                id: Date.now(),
                clienteId: parseInt(clienteId),
                debitosIds: selecionadosIds,
                condicaoId: opcao.condicaoId,
                parcelas: opcao.parcelas,
                valorParcela: opcao.valorParcela,
                valorTotalAcordo: opcao.valorTotal,
                formaPagamento: formaPgto,
                dataSolicitacao: new Date().toISOString(),
                status: 'pendente_boleto' // Requerido: atendente gera o boleto depois
            };
            sessionStorage.setItem('ultimaSolicitacaoId', novaSolicitacao.id);

            solicitacoes.push(novaSolicitacao);
            AppData.set('solicitacoes', solicitacoes);

            // Registra log do cliente confirmando acordo
            AppData.logAction(`Cliente ID ${clienteId}`, "NOVA_SOLICITACAO", `Cliente solicitou acordo usando a condição ID ${opcao.condicaoId} via ${formaPgto}. Valor: R$ ${opcao.valorTotal.toFixed(2)}`);

            // Muda status dos débitos
            selecionadosIds.forEach(id => {
                const index = debitos.findIndex(d => d.id === id);
                if(index > -1) {
                    debitos[index].status = 'em_negociacao';
                }
            });
            AppData.set('debitos', debitos);

            window.location.href = 'confirmacao.html';
        }
    };

});

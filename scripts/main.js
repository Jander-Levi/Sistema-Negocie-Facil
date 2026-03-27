// ==========================================
// SCRIPTS DA ÁREA DO CLIENTE
// Aqui fica toda a "inteligência" (lógica) da tela do cliente. 
// É este arquivo que faz os botões funcionarem, busca os dados da pessoa e mostra na tela.
// ==========================================

// Este comando "DOMContentLoaded" avisa o navegador da internet: 
// "Só comece a executar esses códigos quando a página HTML inteira terminar de carregar!"
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // MÁSCARAS DE ENTRADA DO CLIENTE
    // ==========================================
    const inputCpf = document.getElementById('cpf');
    const inputData = document.getElementById('dadoValidacao');

    if (inputCpf) {
        // Toda vez que a pessoa digitar algo ('input') dentro da caixinha do CPF:
        inputCpf.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Apaga tudo que não for número (ex: letras ou símbolos)
            if (valor.length > 11) valor = valor.slice(0, 11); // Se tentar digitar mais que 11 dígitos, ele corta fora os extras.

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
    // 1. TELA DE CONSULTA DE CPF (A Tela Inicial de Login do Cliente)
    // É onde ele digita o CPF e a data de nascimento para "entrar".
    // ==========================================
    const formConsulta = document.getElementById('formConsulta'); // Pega o formulário no código da página.
    
    // Se o formulário existir (ou seja, se a gente realmente estiver na página inicial):
    if (formConsulta) {
        // Quando a pessoa clicar no botão de "Consultar/Entrar" ('submit'):
        formConsulta.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede a tela de piscar e carregar do zero, para não perder o que foi digitado.
            
            // Pega os textos que foram digitados nessas caixinhas e recorta os espaços em branco nos finais ('trim'):
            const cpfDigitado = document.getElementById('cpf').value.trim();
            const dadoDigitado = document.getElementById('dadoValidacao').value.trim();
            const erroMsg = document.getElementById('erroMsg');
            
            // Pede ao nosso "banco de dados" a lista inteira de clientes.
            const clientes = AppData.get('clientes');
            // Procura na lista usando o 'find': "Olhe um por um e veja se o CPF e a Data de Nascimento batem com o que foi digitado"
            const clienteEncontrado = clientes.find(c => c.cpf === cpfDigitado && c.dadoValidacao === dadoDigitado);

            // REGISTRO AUTOMÁTICO DE CONSULTA DO CLIENTE
            AppData.logAction("Sistema (Cliente Externo)", "CONSULTA_CPF", `Tentativa de consulta via Front. Status: ${clienteEncontrado ? 'Sucesso' : 'Falha'}. CPF mascarado: ***.${cpfDigitado.substring(4,7)}.${cpfDigitado.substring(8,11)}-**`, cpfDigitado);

            // Se os dados baterem ("clienteEncontrado" for verdadeiro):
            if (clienteEncontrado) {
                // Guarda uma "etiqueta" na memória rápida do navegador chamada sessionStorage. 
                // Isso não deixa ele deslogar caso mude de página, mas apaga se ele fechar a aba.
                sessionStorage.setItem('clienteLogadoId', clienteEncontrado.id);
                
                // Redireciona a pessoa mandando ela viajar lá pra página "resultado.html"
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
    // 2. TELA DE RESULTADOS (Onde aparece a lista de dívidas e acordos daquele cliente logado)
    // ==========================================
    window.UIResultados = {
        // A 'init' é a função de pontapé inicial. Ela roda sempre que essa página recarrega.
        init: function() {
            // Tenta pegar aquela "etiqueta" gravada no login para saber a qual ID de cliente pertence a página:
            const clienteId = sessionStorage.getItem('clienteLogadoId');
            
            // Se o ID não for encontrado, quer dizer que alguém tentou acessar a página direto pelo link e está burlando o sistema.
            if(!clienteId) {
                window.location.href = '../index.html'; // Chuta a pessoa de volta pro Início!
                return; // O 'return' imediatamente aborta a função para que nada mais rode.
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

        // Essa função pega o ID da pessoa, varre o sistema, acha as dividas abertas desse ID e injeta ali na tela.
        carregarDebitos: function(clienteId) {
            const todosDebitos = AppData.get('debitos'); // Pega "todas as as dívidas de todo mundo"
            // 'filter' é um filtro que ignora o resto e pega só as que pertencem a ESSE cliente específico e que tão com status 'aberto'
            const meusDebitos = todosDebitos.filter(d => d.clienteId == clienteId && d.status === 'aberto');
            
            // Procura o local vazio marcado no HTML onde a gente deve desenhar a lista.
            const tbody = document.getElementById('tabelaDebitosBody');
            tbody.innerHTML = ''; // Esvazia o local para limpar sujeiras de outras páginas

            // Se esse cliente tiver zero dividas em aberto...
            const divEmptyState = document.getElementById('emptyStateDebitos');
            const divConteudo = document.getElementById('conteudoDebitos');

            if(meusDebitos.length === 0) {
                if (divEmptyState && divConteudo) {
                    divEmptyState.style.display = 'block';
                    divConteudo.style.display = 'none';
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Não há débitos em aberto.</td></tr>';
                }
                return; // Para tudo e não continua essa função.
            } else {
                if (divEmptyState && divConteudo) {
                    divEmptyState.style.display = 'none';
                    divConteudo.style.display = 'block';
                }
            }

            // O 'forEach' é uma alça de repetição. Imagine um funcionário que processa lista de papéis um após o outro:
            // "Para cada" (forEach) dívida na mão daquele cara:
            meusDebitos.forEach(debito => {
                const tr = document.createElement('tr'); // Cria uma "linha" de tabela na memória (sem exibir ainda)
                
                // 'innerHTML' preenche essa linha com pedacinhos de códigos HTML misturados com o preço da dívida e data
                tr.innerHTML = `
                    <td><input type="checkbox" class="chk-debito" value="${debito.id}" data-valor="${debito.valorAtualizado}"></td>
                    <td>${debito.descricao}</td>
                    <td>${debito.vencimentoOriginal.split('-').reverse().join('/')}</td>
                    <td>R$ ${debito.valorOriginal.toFixed(2).replace('.', ',')}</td>
                    <td style="color: var(--cor-principal); font-weight: bold;">R$ ${debito.valorAtualizado.toFixed(2).replace('.', ',')}</td>
                `;
                // Finalmente, gruda (append) a nova 'linha' construída em cima na nossa página web:
                tbody.appendChild(tr);
            });

            // "Escuta" os cliques que ativam ou desativam a caixinha (checkbox). 
            // Cada click manda rodar o 'calcularTotal()', que soma o preço de tudo que tá tickado.
            const checkboxes = document.querySelectorAll('.chk-debito');
            checkboxes.forEach(chk => chk.addEventListener('change', () => this.calcularTotal()));
        },

        // Puxa e preenche se o cliente já chegou a renegociar outras vezes no passado
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

        // Esta função soma quanto de dinheiro as dívidas "ticketadas" marcadas representam todas juntas
        calcularTotal: function() {
            let total = 0; // Caixinha que guarda o valor de tudo somado
            
            // Pega TODAS as caixinhas de marcação (checkbox) que o cidadão marcou ali pela tela:
            const checkboxes = document.querySelectorAll('.chk-debito:checked');
            
            // Passa por cima de cada caixinha dando as voltas da repetição ('forEach')...
            checkboxes.forEach(chk => {
                // ...E vai tacando o valor extraído da caixinha (parseFloat) e armazenando lá no "total"
                total += parseFloat(chk.dataset.valor);
            });

            // Atualiza aquele texto R$ 0,00 piscando pela soma bruta na tela pro cliente ler
            document.getElementById('totalSelecionado').innerText = total.toFixed(2).replace('.', ',');
            
            const btnAvancar = document.getElementById('btnAvancarNegociacao');
            // Se o total na cestinha de pagamento for maior que ZERO (ele deve ter selecionado 1 item no minimo), o botão que antes ficava invisível "aparece". 
            if(total > 0) {
                btnAvancar.style.display = 'inline-block';
            } else { // Se não tiver nada marcado, esconde o botão
                btnAvancar.style.display = 'none';
            }
        },

        // Função do botão "avançar", ela joga o cidadão e a lista inteira marotada pra próxima fase
        avancarNegociacao: function() {
            const checkboxes = document.querySelectorAll('.chk-debito:checked');
            const debitosSelecionados = Array.from(checkboxes).map(chk => parseInt(chk.value));
            
            sessionStorage.setItem('debitosSelecionados', JSON.stringify(debitosSelecionados));
            window.location.href = 'negociacao.html';
        }
    };

    // ==========================================
    // 3. TELA DE NEGOCIAÇÃO E PARCELAMENTO (Na hora que o cliente escolhe as formas de pagamento)
    // ==========================================
    window.UINegociacao = {
        // Ponto de partida sempre que a tela Negociacao for lida
        init: function() {
            const clienteId = sessionStorage.getItem('clienteLogadoId');
            
            // Resgata aquele embrulho (com a listinha de ids das dívidas que foram clicadas na página anterior) q tava guardado num bolso temporário (sessionStorage)
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

            // Essa função pinta as caixinhas ("cards") bonitinhas que dá em quantas vezes ele quer dividir.
            this.gerarOpcoes(selecionados);

            // Ouvinte: se esse bendito tentar confirmar "fechar negócio":
            document.getElementById('btnConfirmarAcordo').addEventListener('click', () => {
                this.solicitarAcordo(clienteId, selecionados); // Aciona o registro de dívida no sistema
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

// ==========================================
// SCRIPTS DA ÁREA ADMINISTRATIVA E ATENDIMENTO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. TELA DE LOGIN ADMIN
    // ==========================================
    const formAdminLogin = document.getElementById('formAdminLogin');
    if (formAdminLogin) {
        formAdminLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('emailAdmin').value.trim().toLowerCase();
            const senha = document.getElementById('senhaAdmin').value.trim();
            const erroMsg = document.getElementById('erroLogin');
            
            const usuarios = AppData.get('usuarios');
            const adminEncontrado = usuarios.find(u => u.email.toLowerCase() === email && u.senha === senha);

            if (adminEncontrado) {
                if(adminEncontrado.status === 'bloqueado') {
                    AppData.logAction("Desconhecido", "LOGIN_FALHA", `Tentativa de login de usuário bloqueado: ${email}`);
                    erroMsg.innerHTML = "Acesso negado. Usuário bloqueado pelo administrador.";
                    erroMsg.style.display = 'block';
                    return;
                }

                // Guarda a sessão de acesso usando sessionStorage
                sessionStorage.setItem('adminLogado', JSON.stringify(adminEncontrado));
                AppData.logAction(adminEncontrado.nome, "LOGIN", "Usuário entrou no painel administrativo.");
                window.location.href = 'dashboard.html';
            } else {
                AppData.logAction("Desconhecido", "LOGIN_FALHA", `Tentativa de acesso falha com email: ${email}`);
                erroMsg.style.display = 'block';
            }
        });
    }

    // ==========================================
    // 2. CONTROLE DE SESSÃO E SEGURANÇA ADMIN
    // Verifica se a pessoa logou sempre que entra no painel
    // ÁREA INTERNA DO ADMIN – NÃO EXPOR
    // ==========================================
    const isLoginScreen = window.location.pathname.includes('login.html');
    const adminStr = sessionStorage.getItem('adminLogado');
    
    // PROTEÇÃO DE ROTA ADMIN - NÃO EXIBIR NO FRONT PÚBLICO
    if(window.location.pathname.includes('/admin/')) {
        if(!isLoginScreen && !adminStr) {
            // Expulsa imediatamente quem tenta acessar direto
            window.location.href = 'login.html';
            return;
        }

        if(!isLoginScreen) {
            const adminUser = JSON.parse(adminStr);
            const userNameDisplays = document.querySelectorAll('.admin-user-name');
            userNameDisplays.forEach(el => el.innerText = adminUser.nome);
            
            const userPerfilDisplays = document.querySelectorAll('.admin-user-perfil');
            userPerfilDisplays.forEach(el => el.innerText = adminUser.perfil.toUpperCase());

            // --- CONTROLE DE ACESSO AVANÇADO (PERFIS) ---
            if (adminUser.perfil !== 'administrador') {
                // Esconde os links do menu restritos
                const navLinks = document.querySelectorAll('nav a');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && (href.includes('usuarios') || href.includes('logs') || href.includes('configuracoes'))) {
                        link.style.display = 'none';
                    }
                });

                // Bloqueia acesso direto pela barra de endereços HTML
                const pathUrl = window.location.pathname;
                if (pathUrl.includes('usuarios.html') || pathUrl.includes('logs.html') || pathUrl.includes('configuracoes.html')) {
                    alert("Acesso Restrito: Seu perfil de " + adminUser.perfil.toUpperCase() + " não possuí privilégios para esta área.");
                    window.location.href = 'dashboard.html';
                    return; // não continua exibindo a tela
                }
            }

            const btnSair = document.getElementById('btnSairAdmin');
            if(btnSair) {
                btnSair.addEventListener('click', (e) => {
                    e.preventDefault();
                    AppData.logAction(adminUser.nome, "LOGOUT", "Usuário saiu do painel.");
                    sessionStorage.removeItem('adminLogado');
                    window.location.href = 'login.html';
                });
            }
        }
    }

    // ==========================================
    // 3. TELA DASHBOARD (Métricas e Contadores)
    // ==========================================
    if(window.location.pathname.includes('dashboard.html')) {
        const debitos = AppData.get('debitos');
        const solicitacoes = AppData.get('solicitacoes');
        
        document.getElementById('lblTotalDebitos').innerText = debitos.length;
        document.getElementById('lblSolicitacoesPendentes').innerText = solicitacoes.filter(s => s.status === 'pendente_boleto').length;
        document.getElementById('lblBoletosGerados').innerText = solicitacoes.filter(s => s.status === 'boleto_enviado').length;
    }

});

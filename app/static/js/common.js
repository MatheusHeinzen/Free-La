// JS utilitário para sidebar, expiração de sessão e logout
//SideBar (Entra e sai da tela)
export function setupSideBar() {
    const sidebar = document.querySelector(".menu_lateral");
    const toggleButton = document.getElementById("toggleSidebar");



    if (!sidebar || !toggleButton) {
        console.warn("Sidebar ou botão não encontrados no DOM.");
        return;
    }

    toggleButton.addEventListener("click", function (event) {
        sidebar.classList.toggle("ativo");
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
            sidebar.classList.remove("ativo");
        }
    });
};

export function toggleSubmenu(event) {
            event.preventDefault();
            const item = event.currentTarget.closest('.has-submenu');
            item.classList.toggle('active');
        }

export function setupSessionExpiration(logoutCallback) {
    let inatividadeTimer;
    function resetarInatividade() {
        clearTimeout(inatividadeTimer);
        inatividadeTimer = setTimeout(() => {
            Swal.fire({
                icon: 'warning',
                title: 'Sessão expirada!',
                text: 'Você foi desconectado devido à inatividade.',
                timer: 3000,
                showConfirmButton: false
            }).then(() => {
                logoutCallback();
            });
        }, 1 * 60 * 1000); // 10 minutos
    }
    document.addEventListener('mousemove', resetarInatividade);
    document.addEventListener('keydown', resetarInatividade);
    document.addEventListener('click', resetarInatividade);
    resetarInatividade();
}

export async function logout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Logout realizado!',
                text: data.mensagem,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível encerrar a sessão. Tente novamente.'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao realizar logout. Tente novamente.'
        });
    }
}


// Para deletar Usuario:
export function showPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

export function fecharPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

export function confirmarDelecao() {
    fetch('user/deletarUsuario', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil deletado com sucesso.',
                    text: "Redirecionando...",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops, algo deu errado.',
                    text: 'Ocorreu um problema para deletar.'
                });
                return false;
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops, algo deu errado.',
                text: 'Contate o suporte, por favor!'
            });
            return false;
        });
}

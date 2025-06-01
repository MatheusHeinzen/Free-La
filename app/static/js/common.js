// JS utilitário para sidebar, expiração de sessão e logout
//SideBar (Entra e sai da tela)
document.addEventListener("DOMContentLoaded", function () {
        const sidebar = document.querySelector(".menu_lateral");
        const toggleButton = document.getElementById("toggleSidebar");

        toggleButton.addEventListener("click", function (event) {
            sidebar.classList.toggle("ativo");
            event.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
                sidebar.classList.remove("ativo");
            }
        });
    });


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
        }, 10 * 60 * 1000); // 10 minutos
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

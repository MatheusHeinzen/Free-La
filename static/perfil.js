document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("dados-usuario");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (usuario) {
        for (const chave in usuario) {
            const item = document.createElement("li");
            item.textContent = `${chave}: ${usuario[chave]}`;
            lista.appendChild(item);
        }
    } else {
        lista.innerHTML = "<li>Nenhum dado encontrado.</li>";
    }
});
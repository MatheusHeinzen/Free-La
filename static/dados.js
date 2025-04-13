const cep = document.querySelector("input[name=cep]");

// document.addEventListener('DOMContentLoaded', () => {
//     cep = this.value.replace(/\D/g, "");
//     $("#cep").mask("00000-000");
//     });

(function () {

    cep.addEventListener('blur', e => {
        const url = `https://viacep.com.br/ws/${cep.value}/json/`;

        fetch(url)
            .then(response => response.json())
            .then(json => {

                if (json.logradouro) {
                    document.querySelector('input[name=logradouro]').value = json.logradouro;
                    document.querySelector('input[name=cidade]').value = json.localidade;
                    document.querySelector('input[name=bairro]').value = json.bairro;
                    document.querySelector('input[name=estado]').value = json.uf;
                }

                else{
                    
                }
    
            });
    });

})(); 
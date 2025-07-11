const apiKeyInput = document.getElementById('apikey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('question');
const submitButton = document.querySelector('button');
const form = document.getElementById('form');
const aiAnswerContainer = document.querySelector('.aiAnswer');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

async function askAI(question, game, apiKey) {
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const questionAI = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responsda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
    `;

    const contents = [{
        role: "user",
        parts: [{
            text: questionAI
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools,
        })

    });
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

async function submitForm(event) {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    submitButton.disabled = true;
    submitButton.innerText = 'Carregando...'
    submitButton.classList.add('loading');

    try {
        const text = await askAI(question, game, apiKey)

        const contentElement = aiAnswerContainer.querySelector('.content');

        if (contentElement) {
            contentElement.innerHTML = markdownToHTML(text);
            aiAnswerContainer.classList.remove('hidden');
        } else {
            console.error("Erro: Não foi possível encontrar o elemento com a classe 'content' dentro de '.aiAnswer'.");
            alert("Ocorreu um erro ao exibir a resposta. Por favor, tente novamente.");
        }

    } catch (error) {
        console.error('Erro geral:', error); // Use console.error para erros
        alert('Ocorreu um erro ao buscar a resposta da IA. Por favor, tente novamente mais tarde.');
    } finally {
        submitButton.disabled = false
        submitButton.textContent = "PERGUNTAR"
        submitButton.classList.remove('loading')
    }

}

form.addEventListener('submit', submitForm);
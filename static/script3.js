document.getElementById('aggiungiMacchinarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const matricola = document.getElementById('matricola').value;
    const reparto = document.getElementById('reparto').value;
    const data_acquisto = document.getElementById('data_acquisto').value;
    const stato_manutenzione = document.getElementById('stato_manutenzione').value;
    const fornitore = document.getElementById('fornitore').value;
    const ultima_manutenzione = document.getElementById('ultima_manutenzione').value;

    try {
        const response = await fetch('/registrazione_macchinario', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione
            }),
        });
        const data = await response.json();
        if (response.status === 200) {
            console.log('Macchinario registrato con successo:', data);
            location.reload(); // Esegui il refresh della pagina dopo il completamento della registrazione
        } else {
            console.error('Si è verificato un errore durante la registrazione del macchinario:', data);
        }
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta:', error);
    }
});


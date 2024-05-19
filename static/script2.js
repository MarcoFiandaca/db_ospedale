document.getElementById('aggiungiPersonaleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const cognome = document.getElementById('cognome').value;
    const data_nascita = document.getElementById('data_nascita').value;
    const luogo_nascita = document.getElementById('luogo_nascita').value;
    const specializzazione = document.getElementById('specializzazione').value;
    const reparto = document.getElementById('reparto').value;

    try {
        const response = await fetch('/registrazione_personale_medico', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto
            }),
        });
        const data = await response.json();
        if (response.status === 200) {
            console.log('Membro del personale registrato con successo:', data);
            location.reload(); // Esegui il refresh della pagina dopo il completamento della registrazione

        } else {
            console.error('Si è verificato un errore durante la registrazione del personale:', data);
        }
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta:', error);
    }
});


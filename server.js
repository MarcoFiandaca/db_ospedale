const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 5500;

const uri = 'mongodb://localhost:27017';
const dbName = 'Ospedale';

let dbClient; // Variabile per memorizzare la connessione al database

// Middleware per analizzare i dati del corpo delle richieste
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware per servire file statici
app.use(express.static('static'));

// Funzione per connettersi al database
async function connectToDatabase() {
  if (!dbClient) {
    dbClient = new MongoClient(uri);
    await dbClient.connect();
  }
}

// Funzione per inserire un nuovo paziente nel database
async function inserisciPaziente(nome, cognome, data_nascita, luogo_nascita, data_ricovero, reparto, data_dimissione) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    const paziente = {
      nome: nome,
      cognome: cognome,
      data_nascita: data_nascita,
      luogo_nascita: luogo_nascita,
      data_ricovero: data_ricovero,
      reparto: reparto,
      data_dimissione: data_dimissione
    };
    const result = await collezionePazienti.insertOne(paziente);
    return result;
  } catch (error) {
    console.error('Errore durante l\'inserimento del paziente:', error);
    throw error;
  }
}

// Funzione per gestire la richiesta di registrazione di un nuovo paziente
app.post('/registrazione_paziente', async (req, res) => {
  const { nome, cognome, data_nascita, luogo_nascita, data_ricovero, reparto, data_dimissione } = req.body;
  try {
    const result = await inserisciPaziente(nome, cognome, data_nascita, luogo_nascita, data_ricovero, reparto, data_dimissione);
    if (result.insertedCount > 0) {
      res.status(200).json({ insertedId: result.insertedId });
    } else {
      res.status(500).send('Si è verificato un errore durante la registrazione del paziente.');
    }
  } catch (error) {
    console.error('Errore durante la registrazione del paziente:', error.message);
    res.status(500).send('Si è verificato un errore durante la registrazione del paziente.');
  }
});

// Funzione per ottenere la lista dei pazienti dal database
async function listaPazienti() {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    const result = await collezionePazienti.find({}, {
     projection: { nome: 1, cognome: 1, data_nascita: 1, luogo_nascita: 1, data_ricovero: 1, data_dimissione: 1, reparto: 1, _id: 1 } }).toArray();
    return result;
  } catch (error) {
    console.error('Errore durante il recupero dei pazienti:', error);
    throw error;
  }
}

// Funzione per gestire la richiesta di ottenere la lista dei pazienti
app.get('/lista_pazienti', async (req, res) => {
  try {
    const pazienti = await listaPazienti();
    res.json(pazienti);
  } catch (error) {
    console.error('Errore durante il recupero dei pazienti:', error.message);
    res.status(500).send('Si è verificato un errore durante il recupero dei pazienti.');
  }
});

// Funzione per eliminare un paziente dal database
async function eliminaPaziente(id) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    const result = await collezionePazienti.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore durante l\'eliminazione del paziente:', error);
    throw error;
  }
}

// Funzione per gestire la richiesta di eliminazione di un paziente
app.delete('/elimina_paziente/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await eliminaPaziente(id);
    if (result.deletedCount > 0) {
      res.status(200).send('Paziente eliminato con successo');
    } else {
      res.status(404).send('Paziente non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione del paziente:', error);
    res.status(500).send('Si è verificato un errore durante l\'eliminazione del paziente');
  }
});

// Funzione per ottenere i dettagli di un paziente dal database
async function dettagliPaziente(id) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    const result = await collezionePazienti.findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli del paziente:', error);
    throw error;
  }
}

// Funzione per gestire la richiesta di ottenere i dettagli di un paziente
app.get('/dettagli_paziente/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const paziente = await dettagliPaziente(id);
    if (paziente) {
      res.json(paziente);
    } else {
      res.status(404).send('Paziente non trovato');
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli del paziente:', error);
    res.status(500).send('Si è verificato un errore durante il recupero dei dettagli del paziente');
  }
});

// Funzione per aggiornare i dettagli di un paziente nel database
async function aggiornaPaziente(id, nuoviDettagli) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    const result = await collezionePazienti.updateOne({ _id: new ObjectId(id) }, { $set: nuoviDettagli });
    return result;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dettagli del paziente:', error);
    throw error;
  }
}

// Funzione per gestire la richiesta di aggiornare i dettagli di un paziente
app.put('/aggiorna_paziente/:id', async (req, res) => {
  const id = req.params.id;
  const nuoviDettagli = req.body;
  try {
    const result = await aggiornaPaziente(id, nuoviDettagli);
    if (result.modifiedCount > 0) {
      res.status(200).send('Dettagli del paziente aggiornati con successo');
    } else {
      res.status(404).send('Paziente non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dettagli del paziente:', error);
    res.status(500).send('Si è verificato un errore durante l\'aggiornamento dei dettagli del paziente');
  }
});


// Funzione per inserire un nuovo membro del personale medico nel database
async function inserisciPersonaleMedico (nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto) {  
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');

    const personaleMedico = {
      nome: nome,
      cognome: cognome,
      data_nascita: data_nascita,
      luogo_nascita: luogo_nascita,
      specializzazione: specializzazione,
      reparto: reparto
    };

    const result = await collezionePersonaleMedico.insertOne(personaleMedico); // Inserimento del documento nella collezione

    return result; // Restituisce il risultato dell'inserimento
  } catch (error) {
    console.error('Errore durante l\'inserimento del membro del personale medico:', error);
    throw error; // Lanciare l'errore per gestirlo più avanti
  } 
};

// Gestione della richiesta di registrazione di un nuovo membro del personale medico
app.post('/registrazione_personale_medico', async (req, res) => {
  const { nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto } = req.body;
  try {
    const result = await inserisciPersonaleMedico(nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto);
    console.log('Risultato:', result);
    // Verifica se l'inserimento è avvenuto con successo
    if (result.insertedCount > 0) {
      res.status(200).json({ insertedId: result.insertedId });
    } else {
      res.status(500).send('Si è verificato un errore durante la registrazione del membro del personale medico.');
    }
  } catch (error) {
    console.error('Errore durante la registrazione del membro del personale medico:', error.message);
    res.status(500).send('Si è verificato un errore durante la registrazione del membro del personale medico.');
  }
});

// Funzione per ottenere la lista del personale medico dal database
async function listaPersonaleMedico() {  
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');

    const result = await collezionePersonaleMedico.find({}, { projection: { nome: 1, cognome: 1, data_nascita: 1, luogo_nascita: 1, specializzazione: 1, reparto: 1, _id: 1 } }).toArray(); // Recupero del personale medico dalla collezione
    return result;
  } catch (error) {
    console.error('Errore durante il recupero del personale medico:', error);
    throw error;
  } 
};

// Gestione della richiesta di ottenere la lista del personale medico
app.get('/lista_personale_medico', async (req, res) => {
  try {
    const personaleMedico = await listaPersonaleMedico();
    res.json(personaleMedico);
  } catch (error) {
    console.error('Errore durante il recupero del personale medico:', error.message);
    res.status(500).send('Si è verificato un errore durante il recupero del personale medico.');
  }
});

// Funzione per eliminare un membro del personale medico dal database
async function eliminaPersonaleMedico(id) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');
    const result = await collezionePersonaleMedico.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore durante di eliminazione', error);
    throw error;
  } 
};

// Gestione della richiesta di eliminazione di un membro del personale medico
app.delete('/elimina_personale_medico/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await eliminaPersonaleMedico(id);
    if (result.deletedCount > 0) {
      res.status(200).send('Membro del personale medico eliminato con successo');
    } else {
      res.status(404).send('Membro del personale medico non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione del membro del personale medico:', error);
    res.status(500).send('Si è verificato un errore durante l\'eliminazione del membro del personale medico');
  }
});

// Funzione per ottenere i dettagli di un membro del personale medico dal database
async function dettagliPersonaleMedico(id){
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');
    const result = await collezionePersonaleMedico.findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli del personale medico:', error);
    throw error;
  } 
};

// Gestione della richiesta di ottenere i dettagli di un membro del personale medico
app.get('/dettagli_personale_medico/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const personaleMedico = await dettagliPersonaleMedico(id);
    if (personaleMedico) {
      res.json(personaleMedico);
    } else {
      res.status(404).send('Membro del personale medico non trovato');
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli del membro del personale medico:', error);
    res.status(500).send('Si è verificato un errore durante il recupero dei dettagli del membro del personale medico');
  }
});

// Funzione per aggiornare i dettagli di un membro del personale medico nel database
async function aggiornaPersonaleMedico(id, nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');
    const result = await collezionePersonaleMedico.updateOne(
      { _id: new ObjectId(id) },
      { $set: { nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto } }
    );
    return result;
  } catch (error) {
    console.error('Errore durante la fase di aggiornamento del personale medico:', error);
    throw error;
  } 
};

// Gestione della richiesta di aggiornamento dei dettagli di un membro del personale medico
app.put('/aggiorna_personale_medico/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto } = req.body;
  try {
    const result = await aggiornaPersonaleMedico(id, nome, cognome, data_nascita, luogo_nascita, specializzazione, reparto);
    if (result.modifiedCount > 0) {
      res.status(200).send('Membro del personale medico aggiornato con successo');
    } else {
      res.status(404).send('Membro del personale medico non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del membro del personale medico:', error);
    res.status(500).send('Si è verificato un errore durante l\'aggiornamento del membro del personale medico');
  }
});


// Funzione per inserire un nuovo macchinario nel database
async function inserisciMacchinari(nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione) {  
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezioneMacchinari = db.collection('macchinari');

    const macchinario = {
      nome: nome,
      matricola: matricola,
      reparto: reparto,
      data_acquisto: data_acquisto,
      stato_manutenzione: stato_manutenzione,
      fornitore: fornitore,
      ultima_manutenzione: ultima_manutenzione
    };

    const result = await collezioneMacchinari.insertOne(macchinario); // Inserimento del documento nella collezione

    return result; // Restituisce il risultato dell'inserimento
  } catch (error) {
    console.error('Errore durante l\'inserimento del macchinario:', error);
    throw error; // Lanciare l'errore per gestirlo più avanti
  } 
};

// Gestione della richiesta di registrazione di un nuovo macchinario
app.post('/registrazione_macchinario', async (req, res) => {
  const { nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione } = req.body;
  try {
    const result = await inserisciMacchinari(nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione);
    console.log('Risultato:', result);
    // Verifica se l'inserimento è avvenuto con successo
    if (result.insertedCount > 0) {
      res.status(200).json({ insertedId: result.insertedId });
    } else {
      res.status(500).send('Si è verificato un errore durante la registrazione del macchinario.');
    }
  } catch (error) {
    console.error('Errore durante la registrazione del macchinario:', error.message);
    res.status(500).send('Si è verificato un errore durante la registrazione del macchinario.');
  }
});

// Funzione per ottenere la lista dei macchinari dal database
async function listaMacchinari() {
  
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezioneMacchinari = db.collection('macchinari');

    const result = await collezioneMacchinari.find({}).toArray(); // Recupero dei macchinari dalla collezione
    return result;
  } catch (error) {
    console.error('Errore durante il recupero dei macchinari:', error);
    throw error;
  } 
};

// Gestione della richiesta di ottenere la lista dei macchinari
app.get('/lista_macchinari', async (req, res) => {
  try {
    const macchinari = await listaMacchinari();
    res.json(macchinari);
  } catch (error) {
    console.error('Errore durante il recupero dei macchinari:', error.message);
    res.status(500).send('Si è verificato un errore durante il recupero dei macchinari.');
  }
});

// Funzione per eliminare un macchinario dal database
async function eliminaMacchinario(id){
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezioneMacchinari = db.collection('macchinari');
    const result = await collezioneMacchinari.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore', error);
    throw error;
  } 
};

// Gestione della richiesta di eliminazione di un macchinario
app.delete('/elimina_macchinario/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await eliminaMacchinario(id);
    if (result.deletedCount > 0) {
      res.status(200).send('Macchinario eliminato con successo');
    } else {
      res.status(404).send('Macchinario non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione del macchinario:', error);
    res.status(500).send('Si è verificato un errore durante l\'eliminazione del macchinario');
  }
});

// Funzione per ottenere i dettagli di un macchinario dal database
async function dettagliMacchinario(id) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezioneMacchinari = db.collection('macchinari');
    const result = await collezioneMacchinari.findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli dei macchinari:', error);
    throw error;
  } 
};

// Gestione della richiesta di ottenere i dettagli di un macchinario
app.get('/dettagli_macchinario/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const macchinario = await dettagliMacchinario(id);
    if (macchinario) {
      res.json(macchinario);
    } else {
      res.status(404).send('Macchinario non trovato');
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli del macchinario:', error);
    res.status(500).send('Si è verificato un errore durante il recupero dei dettagli del macchinario');
  }
});

// Funzione per aggiornare i dettagli di un macchinario nel database
async function aggiornaMacchinario (id, nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezioneMacchinari = db.collection('macchinari');
    const result = await collezioneMacchinari.updateOne(
      { _id: new ObjectId(id) },
      { $set: { nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione } }
    );
    return result;
  } catch (error) {
    console.error('Errore durante la fasi di aggiornamento dei macchinari:', error);
    throw error;
  } 
};

// Gestione della richiesta di aggiornamento dei dettagli di un macchinario
app.put('/aggiorna_macchinario/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione } = req.body;
  try {
    const result = await aggiornaMacchinario(id, nome, matricola, reparto, data_acquisto, stato_manutenzione, fornitore, ultima_manutenzione);
    if (result.modifiedCount > 0) {
      res.status(200).send('Macchinario aggiornato con successo');
    } else {
      res.status(404).send('Macchinario non trovato');
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del macchinario:', error);
    res.status(500).send('Si è verificato un errore durante l\'aggiornamento del macchinario');
  }
});

// Funzione per cercare i pazienti nel database
async function ricercaPaziente(chiave, valore) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePazienti = db.collection('pazienti');
    // Costruiamo una query dinamica per la ricerca
    const query = {};
    query[chiave] = valore; // Utilizziamo la chiave e il valore passati come argomenti per filtrare la ricerca
    const result = await collezionePazienti.find(query).toArray();
    return result;
  } catch (error) {
    console.error('Errore durante la ricerca el paziente:', error);
    throw error;
  } 
};

// Gestione della richiesta di ricerca dei pazienti
app.get('/ricerca_paziente', async (req, res) => {
  const { cognome } = req.query;
  try {
    const pazienti = await ricercaPaziente('cognome', cognome);
    res.json(pazienti);
  } catch (error) {
    console.error('Errore durante la ricerca dei pazienti:', error.message);
    res.status(500).send('Si è verificato un errore durante la ricerca dei pazienti.');
  }
});

// Funzione per cercare i pazienti nel database
async function ricercaPersonale(chiave, valore) {
  try {
    await connectToDatabase();
    const db = dbClient.db(dbName);
    const collezionePersonaleMedico = db.collection('personale_medico');
    // Costruiamo una query dinamica per la ricerca
    const query = {};
    query[chiave] = valore; // Utilizziamo la chiave e il valore passati come argomenti per filtrare la ricerca
    const result = await collezionePersonaleMedico.find(query).toArray();
    return result;
  } catch (error) {
    console.error('Errore durante la ricerca del personale medico:', error);
    throw error;
  } 
};

// Gestione della richiesta di ricerca dei pazienti
app.get('/ricerca_personale_medico', async (req, res) => {
  const { cognome } = req.query;
  try {
    const personale_medico = await ricercaPersonale('cognome', cognome);
    res.json(personale_medico);
  } catch (error) {
    console.error('Errore durante la ricerca:', error.message);
    res.status(500).send('Si è verificato un errore durante la ricerca.');
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);

});









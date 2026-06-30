// logic.js

let listaPersonaggi = [];
let indiceAttuale = 0;
let pg = null;

function calcolaModificatore(punteggio) {
    return Math.floor((punteggio - 10) / 2);
}

function switchSchermata() {
    const vistaGioco = document.getElementById('schermata-gioco');
    const vistaEditor = document.getElementById('schermata-editor');
    if (vistaGioco.style.display === 'none') {
        vistaGioco.style.display = 'flex';
        vistaEditor.style.display = 'none';
    } else {
        vistaGioco.style.display = 'none';
        vistaEditor.style.display = 'block';
        popolaCampiEditor();
    }
}

function modificaPF(valore) {
    if (!pg) return;
    pg.pfAttuali += valore;
    if (pg.pfAttuali < 0) pg.pfAttuali = 0;
    if (pg.pfAttuali > pg.pfMassimi) pg.pfAttuali = pg.pfMassimi;
    document.getElementById('pf-attuali').innerText = pg.pfAttuali;
    salvaNelStorage();
}

function tiraD20(etichetta, bonus) {
    let d20 = Math.floor(Math.random() * 20) + 1;
    let totale = d20 + bonus;
    document.getElementById('display-tiri').innerHTML = `🎲 <strong>${etichetta}</strong>: d20(${d20}) ${bonus >= 0 ? "+" : ""}${bonus} = <strong>${totale}</strong>`;
}

function renderizzaScheda() {
    if (!pg) return;

    // Aggiorna il menu a tendina dei personaggi
    aggiornaSelettorePersonaggi();

    // Dati Generali
    document.getElementById('header-nome').innerText = pg.nome;
    document.getElementById('header-classe').innerText = pg.classeLivello;
    document.getElementById('pf-attuali').innerText = pg.pfAttuali;
    document.getElementById('pf-massimi').innerText = pg.pfMassimi;
    document.getElementById('valore-ca').innerText = pg.ca;
    document.getElementById('valore-iniz').innerText = (pg.iniziativa >= 0 ? "+" : "") + pg.iniziativa;
    document.getElementById('valore-perc').innerText = pg.percezionePassiva;

    // Generazione Caratteristiche
    let htmlCarat = '';
    for (let [chiave, valore] of Object.entries(pg.caratteristiche)) {
        let mod = calcolaModificatore(valore);
        htmlCarat += `<div class="box-carat">
            <div class="nome-carat">${chiave}</div>
            <div class="mod-carat">${mod >= 0 ? "+" : ""}${mod}</div>
            <div class="base-carat">Base: ${valore}</div>
        </div>`;
    }
    document.getElementById('contenitore-caratteristiche').innerHTML = htmlCarat;

    // Generazione Attacchi
    let htmlAttacchi = '';
    pg.attacchi.forEach(a => {
        htmlAttacchi += `<li class="elemento-cliccabile" onclick="tiraD20('${a.nome}', ${a.bonus})">
            <div>
                <div class="nome">${a.nome}</div>
                <div class="sottotitolo">+${a.bonus} a colpire | Danno: ${a.danno}</div>
            </div>
            <div style="color:#ffc107; font-size:12px; font-weight:bold;">TIRA 🎲</div>
        </li>`;
    });
    document.getElementById('contenitore-attacchi').innerHTML = htmlAttacchi;

    // Generazione 18 Abilità dinamiche
    let htmlCompetenze = '';
    let listaCompetenzePG = pg.competenzeScritte.split(',').map(c => c.trim().toLowerCase());

    for (let [nomeAbilita, caratAsso] of Object.entries(MAPPA_ABILITA)) {
        let punteggioCarat = pg.caratteristiche[caratAsso];
        let modBase = calcolaModificatore(punteggioCarat);
        
        let nomeMinuscolo = nomeAbilita.toLowerCase();
        let haCompetenza = listaCompetenzePG.includes(nomeMinuscolo);
        let haMaestria = listaCompetenzePG.includes(nomeMinuscolo + '*');
        
        let bonusTotale = modBase;
        let simbolo = '○';
        let stileColore = 'color: #888;';

        if (haMaestria) {
            bonusTotale += (pg.bonusCompetenza * 2);
            simbolo = '★';
            stileColore = 'color: #ffc107; font-weight: bold;';
        } else if (haCompetenza) {
            bonusTotale += pg.bonusCompetenza;
            simbolo = '●';
            stileColore = 'color: #ffc107;';
        }

        htmlCompetenze += `
            <li class="elemento-cliccabile" onclick="tiraD20('${nomeAbilita} (${caratAsso})', ${bonusTotale})">
                <div>
                    <div class="nome"><span style="${stileColore}">${simbolo}</span> ${nomeAbilita} <span style="font-size:11px; color:#666;">(${caratAsso})</span></div>
                </div>
                <div style="font-size:13px; font-weight:bold; ${stileColore}">${bonusTotale >= 0 ? "+" : ""}${bonusTotale} 🎲</div>
            </li>`;
    }
    document.getElementById('contenitore-competenze').innerHTML = htmlCompetenze;

    document.getElementById('contenitore-note').innerText = pg.note;
}

function salvaDatiPersonaggio() {
    let stringaAttacchi = document.getElementById('input-attacchi').value;
    let arrayAttacchi = [];
    if (stringaAttacchi.trim() !== "") {
        stringaAttacchi.split(';').forEach(pezzo => {
            let dati = pezzo.split(',');
            if(dati.length >= 3) {
                arrayAttacchi.push({ nome: dati[0].trim(), bonus: parseInt(dati[1]), danno: dati[2].trim() });
            }
        });
    }

    let nuovoPg = {
        nome: document.getElementById('input-nome').value || 'Senza Nome',
        classeLivello: document.getElementById('input-classe').value || 'Nessuna Classe',
        pfMassimi: parseInt(document.getElementById('input-pf').value) || 10,
        pfAttuali: parseInt(document.getElementById('input-pf').value) || 10,
        ca: parseInt(document.getElementById('input-ca').value) || 10,
        iniziativa: parseInt(document.getElementById('input-iniz').value) || 0,
        percezionePassiva: parseInt(document.getElementById('input-perc').value) || 10,
        bonusCompetenza: parseInt(document.getElementById('input-bonus-comp').value) || 2,
        caratteristiche: {
            'FOR': parseInt(document.getElementById('input-for').value) || 10,
            'DES': parseInt(document.getElementById('input-des').value) || 10,
            'COS': parseInt(document.getElementById('input-cos').value) || 10,
            'INT': parseInt(document.getElementById('input-int').value) || 10,
            'SAG': parseInt(document.getElementById('input-sag').value) || 10,
            'CAR': parseInt(document.getElementById('input-car').value) || 10,
        },
        attacchi: arrayAttacchi,
        competenzeScritte: document.getElementById('input-competenze').value,
        note: document.getElementById('input-note').value
    };

    if (document.getElementById('editor-nuovo').checked || listaPersonaggi.length === 0) {
        listaPersonaggi.push(nuovoPg);
        indiceAttuale = listaPersonaggi.length - 1;
    } else {
        listaPersonaggi[indiceAttuale] = nuovoPg;
    }

    pg = listaPersonaggi[indiceAttuale];
    salvaNelStorage();
    renderizzaScheda();
    switchSchermata();
}

function popolaCampiEditor() {
    if (!pg) return;
    document.getElementById('input-nome').value = pg.nome;
    document.getElementById('input-classe').value = pg.classeLivello;
    document.getElementById('input-pf').value = pg.pfMassimi;
    document.getElementById('input-ca').value = pg.ca;
    document.getElementById('input-iniz').value = pg.iniziativa;
    document.getElementById('input-perc').value = pg.percezionePassiva;
    document.getElementById('input-bonus-comp').value = pg.bonusCompetenza || 2;
    document.getElementById('input-for').value = pg.caratteristiche.FOR;
    document.getElementById('input-des').value = pg.caratteristiche.DES;
    document.getElementById('input-cos').value = pg.caratteristiche.COS;
    document.getElementById('input-int').value = pg.caratteristiche.INT;
    document.getElementById('input-sag').value = pg.caratteristiche.SAG;
    document.getElementById('input-car').value = pg.caratteristiche.CAR;
    
    let testoAttacchi = pg.attacchi.map(a => `${a.nome},${a.bonus},${a.danno}`).join('; ');
    document.getElementById('input-attacchi').value = testoAttacchi;
    document.getElementById('input-competenze').value = pg.competenzeScritte;
    document.getElementById('input-note').value = pg.note;
    
    document.getElementById('editor-modifica').checked = true;
}

function aggiornaSelettorePersonaggi() {
    let select = document.getElementById('selettore-pg');
    select.innerHTML = '';
    listaPersonaggi.forEach((p, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = p.nome;
        if (index === indiceAttuale) opt.selected = true;
        select.appendChild(opt);
    });
}

function cambiaPersonaggio(index) {
    indiceAttuale = parseInt(index);
    pg = listaPersonaggi[indiceAttuale];
    localStorage.setItem('dnd_indice_attuale', indiceAttuale);
    renderizzaScheda();
}

function eliminaPersonaggioCorrente() {
    if (listaPersonaggi.length <= 1) {
        alert("Non puoi eliminare l'ultimo personaggio rimasto! Creane un altro prima.");
        return;
    }
    if (confirm(`Sei sicuro di voler eliminare definitivamente ${pg.nome}?`)) {
        listaPersonaggi.splice(indiceAttuale, 1);
        indiceAttuale = 0;
        pg = listaPersonaggi[indiceAttuale];
        salvaNelStorage();
        renderizzaScheda();
    }
}

function salvaNelStorage() {
    localStorage.setItem('dnd_lista_personaggi', JSON.stringify(listaPersonaggi));
    localStorage.setItem('dnd_indice_attuale', indiceAttuale);
}

// === FUNZIONI ESPORTA / IMPORTA ===
function esportaDatiDND() {
    let datiDaScaricare = JSON.stringify(listaPersonaggi, null, 2);
    let blob = new Blob([datiDaScaricare], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement('a');
    a.href = url;
    a.download = `backup_personaggi_dnd.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importaDatiDND(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let datiImportati = JSON.parse(e.target.result);
            if (Array.isArray(datiImportati)) {
                listaPersonaggi = datiImportati;
            } else {
                listaPersonaggi = [datiImportati]; // Supporta anche vecchi salvataggi singoli
            }
            indiceAttuale = 0;
            pg = listaPersonaggi[indiceAttuale];
            salvaNelStorage();
            renderizzaScheda();
            alert("Personaggi importati con successo!");
        } catch (errore) {
            alert("Errore nel caricamento del file. Assicurati che sia un file .json valido.");
        }
    };
    reader.readAsText(file);
}

function inizializzaApp() {
    let datiSalvati = localStorage.getItem('dnd_lista_personaggi');
    let indiceSalvato = localStorage.getItem('dnd_indice_attuale');
    
    // Supporto per la transizione dal vecchio sistema a personaggio singolo
    let vecchioPgSingolo = localStorage.getItem('dnd_pg_data');

    if (datiSalvati) {
        listaPersonaggi = JSON.parse(datiSalvati);
        indiceAttuale = indiceSalvato ? parseInt(indiceSalvato) : 0;
    } else if (vecchioPgSingolo) {
        listaPersonaggi = [JSON.parse(vecchioPgSingolo)];
        indiceAttuale = 0;
    } else {
        listaPersonaggi = [personaggioPredefinito];
        indiceAttuale = 0;
    }
    
    pg = listaPersonaggi[indiceAttuale];
    salvaNelStorage();
    renderizzaScheda();
    
    document.getElementById('schermata-gioco').style.display = 'flex';
    document.getElementById('schermata-editor').style.display = 'none';
}
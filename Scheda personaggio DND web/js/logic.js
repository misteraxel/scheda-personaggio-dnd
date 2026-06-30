// logic.js

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
    localStorage.setItem('dnd_pg_data', JSON.stringify(pg));
}

function tiraD20(etichetta, bonus) {
    let d20 = Math.floor(Math.random() * 20) + 1;
    let totale = d20 + bonus;
    document.getElementById('display-tiri').innerHTML = `🎲 <strong>${etichetta}</strong>: d20(${d20}) ${bonus >= 0 ? "+" : ""}${bonus} = <strong>${totale}</strong>`;
}

function renderizzaScheda() {
    if (!pg) return;

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

    // Generazione 18 Abilità dinamiche (Con supporto Competenza e Maestria)
    let htmlCompetenze = '';
    // Creiamo la lista delle competenze scritte dall'utente, tutto in minuscolo
    let listaCompetenzePG = pg.competenzeScritte.split(',').map(c => c.trim().toLowerCase());

    for (let [nomeAbilita, caratAsso] of Object.entries(MAPPA_ABILITA)) {
        let punteggioCarat = pg.caratteristiche[caratAsso];
        let modBase = calcolaModificatore(punteggioCarat);
        
        let nomeMinuscolo = nomeAbilita.toLowerCase();
        
        // Controlla se l'utente ha scritto l'abilità normale o con l'asterisco (Maestria)
        let haCompetenza = listaCompetenzePG.includes(nomeMinuscolo);
        let haMaestria = listaCompetenzePG.includes(nomeMinuscolo + '*');
        
        let bonusTotale = modBase;
        let simbolo = '○';
        let stileColore = 'color: #888;';

        if (haMaestria) {
            bonusTotale += (pg.bonusCompetenza * 2); // Raddoppia il bonus!
            simbolo = '★'; // Stella per la Maestria
            stileColore = 'color: #ffc107; font-weight: bold;';
        } else if (haCompetenza) {
            bonusTotale += pg.bonusCompetenza; // Bonus normale
            simbolo = '●'; // Pallino per la Competenza
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

    // Note
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

    pg = {
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

    localStorage.setItem('dnd_pg_data', JSON.stringify(pg));
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
}

function inizializzaApp() {
    let datiSalvati = localStorage.getItem('dnd_pg_data');
    if (datiSalvati) {
        pg = JSON.parse(datiSalvati);
    } else {
        pg = personaggioPredefinito;
        localStorage.setItem('dnd_pg_data', JSON.stringify(pg));
    }
    renderizzaScheda();
    document.getElementById('schermata-gioco').style.display = 'flex';
    document.getElementById('schermata-editor').style.display = 'none';
}
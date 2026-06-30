// data.js

// Personaggio di partenza se il localStorage è vuoto
const personaggioPredefinito = {
    nome: 'Tordek "Il Barile"',
    classeLivello: 'Guerriero (Campione) - Livello 3',
    pfMassimi: 28,
    pfAttuali: 28,
    ca: 18,
    iniziativa: 2,
    percezionePassiva: 12,
    bonusCompetenza: 2,
    caratteristiche: { 'FOR': 16, 'DES': 14, 'COS': 15, 'INT': 9, 'SAG': 11, 'CAR': 12 },
    attacchi: [
        { nome: 'Spadone a Due Mani', bonus: 5, danno: '2d6+3' },
        { nome: 'Balestra Leggera', bonus: 4, danno: '1d8+2' }
    ],
    competenzeScritte: 'Atletica, Sopravvivenza, Intimidire',
    note: '• Scurovisione 18 metri\n• Stile di Combattimento: Difesa (+1 CA incl.)'
};

// Dizionario ufficiale D&D 5e con le relative caratteristiche associate
const MAPPA_ABILITA = {
    'Atletica': 'FOR',
    'Acrobazia': 'DES',
    'Rapidità di Mano': 'DES',
    'Furtività': 'DES',
    'Arcano': 'INT',
    'Storia': 'INT',
    'Indagare': 'INT',
    'Natura': 'INT',
    'Religione': 'INT',
    'Addestrare Animali': 'SAG',
    'Intuizione': 'SAG',
    'Medicina': 'SAG',
    'Percezione': 'SAG',
    'Sopravvivenza': 'SAG',
    'Inganno': 'CAR',
    'Intimidire': 'CAR',
    'Esibizione': 'CAR',
    'Persuasione': 'CAR'
};
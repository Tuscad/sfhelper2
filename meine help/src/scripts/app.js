import { cardsDatabase } from './cards-db.js';
console.log("Ładowanie bazy kart:", cardsDatabase);
document.getElementById('analyze-btn').addEventListener('click', () => {
    const files = document.getElementById('screenshot-input').files;
    if (files.length === 0) {
        alert("Najpierw wybierz screenshoty!");
        return;
    }
    
    console.log("Wgrano pliki:", files);
    // Tymczasowo - pokaż podgląd obrazów
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '<h3>Podgląd wgranych obrazów:</h3>';
    
    Array.from(files).forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '200px';
        resultsSection.appendChild(img);
    });
//szukanie kart
function showMissingCards() {
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '<h3>Brakujące karty:</h3>';
    
    cardsDatabase.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <img src="${card.normal}" alt="${card.name}" class="missing">
            <p>${card.name} (ID: ${card.id})</p>
        `;
        resultsSection.appendChild(cardElement);
    });
}

// Tymczasowo: symulacja znalezionych kart
const foundCardsIds = [1, 3, 5]; // Przykładowe ID znalezionych kart
document.getElementById('zof-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const zofData = parseZHOF(event.target.result);
        processAlbumData(zofData);
    };
    reader.readAsText(file);
});

function parseZHOF(rawData) {
    try {
        return JSON.parse(rawData); // Dla wersji JSON
    } catch {
        // Parsowanie wersji TXT (niestandardowa logika)
        return parseTextZHOF(rawData); 
    }
}

// API automat
async function fetchZHOF() {
    const response = await fetch('https://sfgame.net/api/zof/YOUR_PLAYER_ID');
    return await response.json();
}
function processAlbumData(zofData) {
    const allCards = cardsDatabase; // Importowana wcześniej baza kart
    const userCards = {
        normal: zofData.album.normal_cards || [],
        shiny: zofData.album.shiny_cards || []
    };

    // Znajdź brakujące karty
    const missingNormal = allCards.filter(
        card => !userCards.normal.includes(card.id)
    );
    const missingShiny = allCards.filter(
        card => userCards.normal.includes(card.id) && 
               !userCards.shiny.includes(card.id)
    );

    displayResults(missingNormal, missingShiny);
}

function displayResults(missingNormal, missingShiny) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (missingNormal.length === 0 && missingShiny.length === 0) {
        resultsDiv.innerHTML = '<p class="success">✅ Masz kompletny album!</p>';
        return;
    }

    // Wyświetl brakujące normalne
    if (missingNormal.length > 0) {
        const section = document.createElement('div');
        section.innerHTML = '<h3>🟡 Brakujące normalne karty:</h3>';
        missingNormal.forEach(card => {
            section.innerHTML += `<div class="card">
                <img src="${card.normal}" alt="${card.name}">
                <p>${card.name} (ID: ${card.id})</p>
            </div>`;
        });
        resultsDiv.appendChild(section);
    }

    // Wyświetl brakujące shiny
    if (missingShiny.length > 0) {
        const section = document.createElement('div');
        section.innerHTML = '<h3>✨ Brakujące shiny:</h3>';
        missingShiny.forEach(card => {
            section.innerHTML += `<div class="card">
                <img src="${card.shiny}" alt="${card.name}">
                <p>${card.name} (ID: ${card.id})</p>
            </div>`;
        });
        resultsDiv.appendChild(section);
    }
}
});
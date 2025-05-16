
const startInput = document.getElementById('start-date');
const endInput = document.getElementById('end-date');
const durationText = document.getElementById('duration');

function updateDuration() {
    const start = new Date(startInput.value);
    const end = new Date(endInput.value);

    if (!isNaN(start) && !isNaN(end)) {
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    durationText.textContent = `Duration: ${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
    }
}

startInput.addEventListener('change', updateDuration);
endInput.addEventListener('change', updateDuration);
updateDuration();

const cityInput = document.getElementById('city-input');
const cityNameText = document.getElementById('city-name-text');
const banner = document.querySelector('.banner');

const cityImages = {
    'Vijayawada': 'vij.png',
    'Hyderabad': 'hyd.png',
    'Bangalore': 'ban.png',
    'Chennai': 'ch.png',
    'Tirupati': 't.png',
    'Agra': 'ag.png',
    'Vizag': 'Vizag.png',
    'Guntur': 'gu.png',
    'Delhi': 'del.png',
    'Mumbai': 'mum.png',
    'Kolkata': 'kol.png',
    'Jaipur': 'jai.png',
};

function normalizeCityName(city) {
    city = city.trim();
    for (const key in cityImages) {
    if (key.toLowerCase() === city.toLowerCase()) {
        return key;
    }
    }
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

function updateCity(city) {
    cityInput.value = city;
    cityNameText.textContent = city;

    const cityKey = normalizeCityName(city);
    const imageFile = cityImages[cityKey] || 'default.png';
    banner.src = `/images/${imageFile}`;
    banner.alt = cityKey + " Banner";
}

const savedCity = localStorage.getItem('selectedCity');
if (savedCity) {
    updateCity(savedCity);
}

document.getElementById('location-box').addEventListener('click', () => {
    window.location.href = 'city.html';
});

window.addEventListener('focus', () => {
    const newCity = localStorage.getItem('selectedCity');
    if (newCity && newCity !== cityInput.value) {
    updateCity(newCity);
    }
});

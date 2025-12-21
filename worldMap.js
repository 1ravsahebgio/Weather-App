// World Map Logic
import { getWeather, getLastWeatherData, initNavigation } from "./app.js";

let map;
let markers = [];
let userLocationMarker = null;
let currentlyDisplayedCity = null;

// Cities ko localStorage se load karo
let cities = JSON.parse(localStorage.getItem('savedCities')) || [];

// ✅ Cities ko localStorage mein save karo
function saveCitiesToStorage() {
    localStorage.setItem('savedCities', JSON.stringify(cities));
}


// ✅ Get city coordinates from OpenWeather Geocoding API
async function getCityCoordinates(cityName) {
    try {
        const apiKey = "3511726570aad7b131bd748e2e8b042d";
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

        const response = await fetch(geocodingUrl);
        if (!response.ok) throw new Error("Geocoding API failed");

        const data = await response.json();

        if (data && data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            console.log(`📍 ${cityName} coordinates: [${lat}, ${lon}]`);
            return [lat, lon];
        } else {
            console.log(`❌ Coordinates not found for: ${cityName}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Geocoding error for ${cityName}:`, error);

        // Fallback to hardcoded coordinates
        const cityCoordinates = {
            'mumbai': [19.0760, 72.8777],
            'delhi': [28.7041, 77.1025],
            'bangalore': [12.9716, 77.5946],
            'hyderabad': [17.3850, 78.4867],
            'chennai': [13.0827, 80.2707],
            'kolkata': [22.5726, 88.3639],
            'pune': [18.5204, 73.8567],
            'ahmedabad': [23.0225, 72.5714],
            'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462],
            'nashik': [20.0059, 73.7910],
            'nagpur': [21.1458, 79.0882],
            'indore': [22.7196, 75.8577],
            'thane': [19.2183, 72.9781],
            'bhopal': [23.2599, 77.4126],
            'latur': [18.4088, 76.5604],
            'nanded': [19.1383, 77.3210],
            'udgir': [18.3950, 77.1200]
        };

        return cityCoordinates[cityName.toLowerCase()] || null;
    }
}

// ✅ Load saved cities as markers on map (async bana do)
async function loadCitiesOnMap() {

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (cities.length === 0) return;

    // Har city ke liye coordinates fetch karo
    for (const city of cities) {
        const coordinates = await getCityCoordinates(city.name);

        if (coordinates) {
            const marker = L.marker(coordinates)
                .bindPopup(createPopupContent(city))
                .addTo(map);

            marker.on('click', function () {
                // Map pe zoom karo
                map.setView(coordinates, 10);
                currentlyDisplayedCity = city.name;
            });

            markers.push(marker);
        }
    }
}

// ✅ Add city to map as marker (async bana do)
async function addCityToMap(name, time, temp, icon) {
    const coordinates = await getCityCoordinates(name);
    if (coordinates) {
        const marker = L.marker(coordinates)
            .bindPopup(`
                <div class="weather-popup">
                    <h3>${name}</h3>
                    <div class="temp">${temp}°C</div>
                    <div class="time">${time}</div>
                </div>
            `)
            .addTo(map);

        marker.on('click', function () {
            currentlyDisplayedCity = name;
        });

        markers.push(marker);

        // ✅ Map pe zoom karo us city pe
        map.setView(coordinates, 10);
    }
}

// ✅ Initialize map
function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load saved cities
    loadCitiesOnMap();
    loadCitiesList();

    // Get user location
    getUserLocation();
}

// ✅ User ki live location get karo
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const { latitude, longitude } = position.coords;
                showUserLocation(latitude, longitude);
            },
            function (error) {
                console.log("Location access denied:", error);
            }
        );
    }
}

// ✅ User location show karo map pe
function showUserLocation(lat, lng) {
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-location"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    userLocationMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>📍 Your Current Location</b>');
}

// ✅ Load cities in right side list
function loadCitiesList() {

    initNavigation();

    const cityList = document.getElementById("listCity");
    cityList.innerHTML = '';

    if (cities.length === 0) {
        const zeroCity = document.createElement("div");
        zeroCity.classList.add("noCity");
        zeroCity.style.textAlign = "center";
        zeroCity.innerHTML = `<b>Search cities to see them on map</b>`;
        cityList.appendChild(zeroCity);
        return;
    }

    // ✅ Har saved city ka card banayo
    for (const cityData of cities) {
        addCityCard(cityData.name, cityData.time, cityData.temp, cityData.icon);
    }
}

// Limit String
function limitString(str, num) {
    return str.length > num ? str.slice(0, num) + "..." : str;
}

// ✅ Add city card
function addCityCard(name, time, temp, icon) {
    const cityList = document.getElementById("listCity");

    // ✅ Remove "Start by searching" message agar exist karta hai
    const noCityMessage = cityList.querySelector('.noCity');
    if (noCityMessage) {
        noCityMessage.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("city-wrapper");
    wrapper.setAttribute("data-city", name);


    wrapper.innerHTML = `
    <div class="city-card">
        <div class="city-left">
            <img src="${icon}" alt="${name} weather" class="weather-icon">
            <div class="city-info">
                <h3>${limitString(name, 10)}</h3>
                <p>${time}</p>
            </div>
        </div>
        <div class="city-temp">${temp}°</div>
        </div>
        <button class="remove-btn">×</button>
`;

    const card = wrapper.querySelector(".city-card");
    const removeBtn = wrapper.querySelector(".remove-btn");

    // ✅ CLICK → Map pe zoom karo + Card baada karo
    card.addEventListener("click", async (e) => {
        e.stopPropagation();

        // ✅ Pehle sabhi cards ko close karo
        document.querySelectorAll('.city-wrapper.active').forEach(activeCard => {
            if (activeCard !== wrapper) {
                activeCard.classList.remove('active');
            }
        });

        // ✅ Current card ko toggle karo (baada/chota)
        wrapper.classList.toggle('active');

        if (wrapper.classList.contains('active')) {
            currentlyDisplayedCity = name;

            // ✅ Map pe zoom karo us city pe
            const coordinates = await getCityCoordinates(name);
            if (coordinates) {
                map.setView(coordinates, 10);
            }
        }
    });

    // ✅ REMOVE BUTTON
    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        wrapper.classList.add("remove");
        setTimeout(() => {
            wrapper.remove();
            // ✅ City ko array se bhi remove karo
            cities = cities.filter((city) => city.name !== name);
            // ✅ Updated array ko save karo
            saveCitiesToStorage();

            // ✅ Agar removed city currently displayed hai toh reset karo
            if (currentlyDisplayedCity === name) {
                currentlyDisplayedCity = null;
            }

            // ✅ Marker bhi remove karo
            const markerIndex = markers.findIndex(m => {
                const popupContent = m.getPopup().getContent();
                return popupContent.includes(name);
            });
            if (markerIndex !== -1) {
                map.removeLayer(markers[markerIndex]);
                markers.splice(markerIndex, 1);
            }

            // ✅ Agar sab cities remove ho gayi toh message show karo
            if (cities.length === 0) {
                const zeroCity = document.createElement("div");
                zeroCity.classList.add("noCity");
                zeroCity.innerHTML = `<b>Search cities to see them on map</b>`;
                cityList.appendChild(zeroCity);
            }
        }, 800);
    });

    // ✅ New card ko TOP me add karo
    if (cityList.firstChild) {
        cityList.insertBefore(wrapper, cityList.firstChild);
    } else {
        cityList.appendChild(wrapper);
    }
}

// ✅ Create popup content
function createPopupContent(city) {
    return `
        <div class="weather-popup">
            <h3>${city.name}</h3>
            <div class="temp">${city.temp}°C</div>
            <div class="time">${city.time}</div>
        </div>
    `;
}

// ✅ ADD CITY FUNCTION
async function addCity(c, time, temp, icon) {
    console.log("🔄 addCity called with:", { c, time, temp, icon });

    // ✅ Capitalize properly
    c = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();

    // ✅ Check if city already exists
    const existingIndex = cities.findIndex(city => city.name === c);

    if (existingIndex !== -1) {
        // ✅ Agar city already hai, use remove karo
        cities.splice(existingIndex, 1);
        document.querySelector(`[data-city="${c}"]`)?.remove();
    } else if (cities.length >= 10) {
        // ✅ Agar 10 cities hain aur new city hai, toh LAST wali remove karo
        const removedCity = cities.pop();
        document.querySelector(`[data-city="${removedCity.name}"]`)?.remove();
    }

    // ✅ New city ko START me add karo (with full data)
    const cityData = {
        name: c,
        time: time,
        temp: temp,
        icon: icon
    };
    cities.unshift(cityData);

    // ✅ Cities ko save karo localStorage mein
    saveCitiesToStorage();

    // ✅ Card banao
    addCityCard(c, time, temp, icon);

    // ✅ Map pe bhi marker add karo
    await addCityToMap(c, time, temp, icon);

    console.log("✅ City added successfully:", c);
}

// ✅ SEARCH FUNCTIONALITY - Using app.js functions only
async function handleMapSearch() {
    const input = document.getElementById("inputData");
    const city = input.value.trim();

    console.log("🔍 Searching for:", city);

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    try {
        console.log("🔄 Calling getWeather from app.js...");

        // ✅ Use app.js getWeather - NO DIRECT API CALLS
        await getWeather(city);

        // ✅ Wait for data to load properly
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ Get data from app.js 
        const data = getLastWeatherData();
        console.log("📊 Weather data from app.js:", data);

        if (data && data.city && data.temp && data.icon && data.time) {
            console.log("✅ Valid city found, adding...");
            await addCity(data.city, data.time, data.temp, data.icon);
            currentlyDisplayedCity = data.city;
            input.value = "";
        } else {
            console.log("❌ Invalid city data — not added");
            alert("City not found! Please try again.");
            input.value = "";
        }

    } catch (error) {
        console.log("❌ Error in search:", error);
        alert("Error searching city! Please try again.");
        input.value = "";
    }
}

// ✅ Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    console.log("🗺️ World Map initialized");
    initMap();

    const input = document.getElementById("inputData");
    const searchBtn = document.getElementById("search");

    // ✅ Search button click
    searchBtn.addEventListener("click", handleMapSearch);

    // ✅ Enter key press
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleMapSearch();
    });

    // ✅ Document pe click listener
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.city-wrapper')) {
            document.querySelectorAll('.city-wrapper.active').forEach(card => {
                card.classList.remove('active');
            });
        }
    });
});
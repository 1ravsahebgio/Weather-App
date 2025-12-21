import { getWeather, defaultWeather, getLastWeatherData, initNavigation } from "./app.js";

// ✅ Cities ko localStorage se load karo
let cities = JSON.parse(localStorage.getItem('savedCities')) || [];
let currentlyDisplayedCity = null;

// ✅ Page load pe saved cities show karo
window.addEventListener("DOMContentLoaded", async () => {
  await defaultWeather();

  initNavigation();

  // ✅ Pehle se saved cities ko load karo
  loadSavedCities();

  function addCity(c, time, temp, icon) {
    // ✅ Capitalize properly
    c = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();

    // ✅ Check if city already exists
    const existingIndex = cities.findIndex(city => city.name === c);

    if (existingIndex !== -1) {
      // ✅ Agar city already hai, use remove karo
      cities.splice(existingIndex, 1);
      // ✅ Us city ka purana card remove karo
      document.querySelector(`[data-city="${c}"]`)?.remove();
    } else if (cities.length >= 15) {
      // ✅ Agar 15 cities hain aur new city hai, toh LAST wali remove karo
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

    console.log("📋 Current city order:", cities);
  }

  // 🔍 Search logic (click + enter dono handle)
  let input = document.getElementById("inputData");
  const searchData = document.getElementById("search");


  async function handleSearch() {
    const city = input.value.trim();
    if (!city) return console.log("Please Enter City Name");

    await getWeather(city);
    const data = getLastWeatherData();

    // agar valid city mila
    if (data.city) {
      addCity(data.city, data.time, data.temp, data.icon);
      currentlyDisplayedCity = data.city;
      input.value = ""; // clear input after search
    } else {
      console.log("❌ Invalid city — not added");
    }
  }

  searchData.addEventListener("click", handleSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSearch();
  });

  // ✅ Document pe click listener - kahi bhi click karo toh sab cards close ho
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.city-wrapper')) {
      document.querySelectorAll('.city-wrapper.active').forEach(card => {
        card.classList.remove('active');
      });
    }
  });
});

// ✅ Saved cities ko load karke show karo
async function loadSavedCities() {
  const cityList = document.getElementById("listCity");

  // ✅ Agar koi city nahi hai toh message show karo
  if (!cities.length) {
    const zeroCity = document.createElement("div");
    zeroCity.classList.add("noCity");
    zeroCity.innerHTML = `<b>Start by searching for a city</b>`;
    cityList.appendChild(zeroCity);
    return;
  }

  // ✅ Har saved city ka card banayo
  for (const cityData of cities) {
    addCityCard(cityData.name, cityData.time, cityData.temp, cityData.icon);
  }
}

// ✅ Cities ko localStorage mein save karo
function saveCitiesToStorage() {
  localStorage.setItem('savedCities', JSON.stringify(cities));
}

// 🏠 Home & City Icons logic
const home = document.getElementById("homeIcon");
const cityIcon = document.getElementById("cityIcon");
let cityActive = false;

cityIcon.addEventListener("click", function () {
  cityActive = true;
});

home.addEventListener("click", function () {
  if (cityActive) {
    location.reload();
    cityActive = false;
  } else {
    console.log("Home reload nahi hua kyunki city page active nahi hai");
  }
});

// Limit String use 
function limitString(str, num) {
  return str.length > num ? str.slice(0, num) + "..." : str;
}
  


// 🌆 City card UI creator
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

  // ✅ CLICK → City ka data right container mein show karo + Card baada karo
  card.addEventListener("click", async (e) => {
    e.stopPropagation();

    document.querySelectorAll('.city-wrapper.active').forEach(activeCard => {
      if (activeCard !== wrapper) {
        activeCard.classList.remove('active');
      }
    });

    wrapper.classList.toggle('active');

    if (wrapper.classList.contains('active')) {
      if (currentlyDisplayedCity === name) {
        console.log(`✅ ${name} already displayed, skipping refresh`);
        return;
      }

      console.log(`🔄 Loading data for: ${name}`);
      await getWeather(name);
      currentlyDisplayedCity = name;
    }
  });

  // ✅ REMOVE BUTTON
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    wrapper.classList.add("remove");
    setTimeout(() => {
      wrapper.remove();
      cities = cities.filter((city) => city.name !== name);
      saveCitiesToStorage();

      if (currentlyDisplayedCity === name) {
        currentlyDisplayedCity = null;
      }

      if (cities.length === 0) {
        const zeroCity = document.createElement("div");
        zeroCity.classList.add("noCity");
        zeroCity.innerHTML = `<b>Start by searching for a city</b>`;
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
// weather.js
export async function getWeather(cityName) {
  // Temprature Section 
  const cRain = document.getElementById("cRain");
  const degree = document.getElementById("degree");
  const city = document.getElementById("DefaultCityName");

  // Air Condition Section 
  const realFeels = document.getElementById("realFeels");
  const windSpeed = document.getElementById("windSpeed");
  const chanceRain = document.getElementById("chanceRain");
  const uVIndex = document.getElementById("uVIndex");

  // Forecast Section 
  const forecastKeys = ["sixAm", "nineAm", "twelvePm", "threePm", "sixPm", "ninePm"];
  const forecastHours = [6, 9, 12, 15, 18, 21];

  const showForecast = {};
  const showIcons = {};
  forecastKeys.forEach(key => {
    showForecast[key] = document.querySelector(`#${key} h2`);
    showIcons[key] = document.querySelector(`#${key} img`);
  });

  function shortCityName(name) {
    return name.length > 9 ? `<p style="font-size:25px;">${name.slice(0, 9)}...</p>` : name;
  }

  // 7 Days Forecast - Universal function for both APIs
  function createWeeklyForecast(forecastData, source) {
    const container = document.getElementById("showWeeklyFor");
    container.innerHTML = ""; // clear old data

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    function shortCondition(text) {
      const t = text.toLowerCase();
      if (/sun|clear/.test(t)) return "Sunny";
      if (/cloud/.test(t)) return "Cloudy";
      if (/rain|drizzle/.test(t)) return "Rainy";
      if (/snow/.test(t)) return "Snow";
      if (/thunder|storm/.test(t)) return "Storm";
      return "Cloudy";
    }


    if (source === "weatherapi") {
      // WeatherAPI format - 7 days directly
      forecastData.forEach((dayData, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const dayName = i === 0 ? "Today" : daysOfWeek[date.getDay()];

        const condition = shortCondition(dayData.day.condition.text);
        const icon = `https:${dayData.day.condition.icon}`;
        const max = Math.floor(dayData.day.maxtemp_c);
        const min = Math.floor(dayData.day.mintemp_c);

        console.log(condition);
        container.innerHTML += `
        <div class="foreCard">
          <span class="dayN">${dayName}</span>
          <div class="imgSpan">
            <img src="${icon}" alt="${condition}" width="50px" height="50px">
           <div class="containtDiv">
           <span>${condition}</span>
           </div>
          </div>
          <div class="minMax">
            <span class="max-temp">${max}</span>
            <span class="slash">/</span>
            <span class="min-temp">${min}</span>
          </div>
        </div>
        <div class="bottomB"></div>
      `;
      });


    } else if (source === "openweather") {
      // OpenWeatherMap format - 5 days to 7 days conversion
      const dailyData = {};

      // Group by date (YYYY-MM-DD format)
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            temps: [],
            conditions: [],
            icons: [],
            rainChance: []
          };
        }
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].conditions.push(item.weather[0].description);
        dailyData[dateKey].icons.push(item.weather[0].icon);
        dailyData[dateKey].rainChance.push(item.pop || 0);
      });

      // Create exactly 7 days forecast
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        const dayName = i === 0 ? "Today" : daysOfWeek[date.getDay()];

        if (dailyData[dateKey]) {
          const dayData = dailyData[dateKey];
          const maxTemp = Math.floor(Math.max(...dayData.temps));
          const minTemp = Math.floor(Math.min(...dayData.temps));
          const avgRainChance = Math.round((dayData.rainChance.reduce((a, b) => a + b, 0) / dayData.rainChance.length) * 100);

          // Most common condition for the day
          const mostCommonCondition = dayData.conditions.reduce((a, b) =>
            dayData.conditions.filter(v => v === a).length >=
              dayData.conditions.filter(v => v === b).length ? a : b
          );

          const condition = shortCondition(mostCommonCondition);
          const iconCode = dayData.icons[0]; // Use first icon of the day
          const icon = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; 

          container.innerHTML += `
          <div class="foreCard">
            <span class="dayN">${dayName}</span>
            <div class="imgSpan">
              <img src="${icon}" alt="${condition}" width="50px" height="50px">
             <div class="containtDiv">
            <span>${condition}</span>
             </div>
            </div>
            <div class="minMax">
              <span class="max-temp">${maxTemp}</span>
              <span class="slash">/</span>
              <span class="min-temp">${minTemp}</span>
            </div>
          </div>
          <div class="bottomB"></div>
        `;
        } else {
          // If no data for future date (beyond 5 days), show estimated data
          const estimatedTemp = 25 + (i * 2); // Simple estimation
          container.innerHTML += `
          <div class="foreCard">
            <span class="dayN">${dayName}</span>
            <div class="imgSpan">
              <img src="https://openweathermap.org/img/wn/01d@2x.png" alt="Estimated" width="50px" height="50px">
              <span>Sunny</span>
            </div>
            <div class="minMax">
              <span class="max-temp">${estimatedTemp}</span>
              <span class="slash">/</span>
              <span class="min-temp">${estimatedTemp - 5}</span>
            </div>
          </div>
          <div class="bottomB"></div>
        `;
        }
      }
    }
  }

  // Loading feedback
  cRain.innerText = "Loading weather data...";
  degree.innerText = "⏳";

  try {
    // --- WeatherAPI --- (Primary)
    const weatherApiKey = "52a727de55f349348b585832252710";
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${cityName}&aqi=yes`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${cityName}&days=7&aqi=yes`;

    const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);

    if (!currentRes.ok || !forecastRes.ok) throw new Error("WeatherAPI failed");

    const data = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Update UI with WeatherAPI data
    updateBasicInfo(data.location.name, data.current.temp_c, forecastData.forecast.forecastday[0].day.daily_chance_of_rain);
    updateAirCondition(data.current.feelslike_c, data.current.wind_kph, forecastData.forecast.forecastday[0].day.daily_chance_of_rain, data.current.uv);
    updateForecast(forecastData.forecast.forecastday[0].hour, forecastKeys, forecastHours, showForecast, showIcons, "weatherapi");
    createWeeklyForecast(forecastData.forecast.forecastday, "weatherapi");

  } catch (err) {
    console.log("⚠ WeatherAPI failed, trying OpenWeather...", err);
    await getFromOpenWeather(cityName);
  }

  // ----- Helper functions -----
  function updateBasicInfo(cityName, tempC, rainChance) {
    degree.innerHTML = `${Math.floor(tempC)}&deg;`;
    city.innerHTML = shortCityName(cityName);
    cRain.innerText = `Chance of rain: ${rainChance}%`;
  }

  function updateAirCondition(feelsLikeC, windKph, rainChance, uv) {
    realFeels.innerHTML = `${Math.floor(feelsLikeC)}&deg;`;
    windSpeed.innerText = `${windKph} km/h`;
    chanceRain.innerText = `${rainChance}%`;
    uVIndex.innerText = uv !== undefined ? uv : "N/A";
  }

  function updateForecast(hourDataArray, keys, hours, forecastElems, iconElems, source) {
    keys.forEach((key, i) => {
      let hourData;
      if (source === "weatherapi") {
        hourData = hourDataArray[hours[i]];
        if (!hourData) return;
        forecastElems[key].innerHTML = `${Math.floor(hourData.temp_c)}&deg;`;
        iconElems[key].src = `https:${hourData.condition.icon}`;
        iconElems[key].alt = hourData.condition.text;
      } else if (source === "openweather") {
        // closest hour
        hourData = hourDataArray.reduce((prev, curr) => {
          const prevHour = new Date(prev.dt * 1000).getHours();
          const currHour = new Date(curr.dt * 1000).getHours();
          return Math.abs(currHour - hours[i]) < Math.abs(prevHour - hours[i]) ? curr : prev;
        });
        forecastElems[key].innerHTML = `${Math.floor(hourData.main.temp)}&deg;`;
        iconElems[key].src = `https://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`;
        iconElems[key].alt = hourData.weather[0].description;
        iconElems[key].style.width = "65px";
        iconElems[key].style.height = "65px";
      }
    });
  }

  // ----- OpenWeather fallback with proper 7-day forecast -----
  async function getFromOpenWeather(cityName) {
    try {
      const apiKey = "3511726570aad7b131bd748e2e8b042d";
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

      const [fetchCurrent, fetchForecast] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);

      if (!fetchCurrent.ok) throw new Error("OpenWeather current fetch failed");
      if (!fetchForecast.ok) throw new Error("OpenWeather forecast fetch failed");

      const currentData = await fetchCurrent.json();
      const forecastData = await fetchForecast.json();

      // Calculate chance of rain from OpenWeather data
      const chanceOfRain = forecastData.list[0].pop ? Math.round(forecastData.list[0].pop * 100) : 0;

      // Update UI with OpenWeather data
      updateBasicInfo(currentData.name, currentData.main.temp, chanceOfRain);
      updateAirCondition(
        currentData.main.feels_like,
        (currentData.wind.speed * 3.6).toFixed(1),
        chanceOfRain,
        "N/A" // UV not available in free tier
      );

      updateForecast(forecastData.list, forecastKeys, forecastHours, showForecast, showIcons, "openweather");
      createWeeklyForecast(forecastData, "openweather");

    } catch (error) {
      console.log("❌ OpenWeather also failed:", error);

      // Show error state
      cRain.innerText = "City not found 😢";
      degree.innerText = "--";
      city.innerHTML = "Unknown";
      realFeels.innerHTML = "--";
      windSpeed.innerText = "--";
      chanceRain.innerText = "--";
      uVIndex.innerText = "--";

      const container = document.getElementById("showWeeklyFor");
      container.innerHTML = `<h1 style="color:#c4cad3; text-align:center; font-size:2rem;">No Data Available</h1>`;
    }
  }
}

// --- Default weather function ---
export async function defaultWeather() {
  await getWeather("Mumbai");

}

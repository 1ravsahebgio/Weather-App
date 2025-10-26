// 🌤️ Ye function sirf weather data laane ka kaam karega

import { getWeather } from './app.js';
import { defaultWeather } from './app.js';


window.addEventListener("DOMContentLoaded", async () => {

    await defaultWeather();

    
    let input = document.getElementById("inputData");
    const searchData = document.getElementById("search");

    searchData.addEventListener("click", async function () {
        const city = document.getElementById("inputData").value.toLowerCase().trim();
        if (!city) return console.log("Please Enter City Name");
        await getWeather(city);
    });

    input.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            const city = document.getElementById("inputData").value.toLowerCase().trim();
            if (!city) return console.log("Please Enter City Name");
            await getWeather(city);
        }
    });
});




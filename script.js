// 🌤️ Weather App Main Logic - INDEX PAGE
import { getWeather, defaultWeather, initNavigation, currentIsDay } from "./app.js";
import { initSkyAnimation } from "./canvasAnimation.js";



window.addEventListener("DOMContentLoaded", async () => {
    // -------------------------------------------
    // ⭐ STEP 1: Last searched city load karo
    // -------------------------------------------
    let lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        // Agar last city stored hai → wahi weather show karo
        await getWeather(lastCity);
    } else {
        // Agar city saved nahi hai → default pune load karo
        await defaultWeather();
        localStorage.setItem("lastCity", "Pune");
    }

    // -------------------------------------------
    // ⭐ STEP 2: Animation run karo
    // -------------------------------------------


    setTimeout(() => {
        console.log("🔍 After timeout - currentIsDay:", currentIsDay);
        initSkyAnimation('temprature', currentIsDay);
    }, 100);

    // -------------------------------------------
    // ⭐ Navigation Init
    // -------------------------------------------
    initNavigation();


    // -------------------------------------------
    // ⭐ Search Logic
    // -------------------------------------------
    let input = document.getElementById("inputData");
    const searchData = document.getElementById("search");

    async function handleSearch() {
        const city = input.value.trim();
        if (!city) return console.log("Please Enter City Name");

        // Weather fetch
        await getWeather(city);

        // ⭐ STEP 3: Last searched city ko save karo
        localStorage.setItem("lastCity", city);
        // ⭐ INPUT CLEAR KARO
        input.value = "";
        // Animation update
        initSkyAnimation('temprature', currentIsDay);
    }

    searchData.addEventListener("click", handleSearch);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") handleSearch();
    });


    // -------------------------------------------
    // ⭐ STEP 4: Auto Refresh every 10 minutes
    // -------------------------------------------
    setInterval(async () => {
        let savedCity = localStorage.getItem("lastCity") || "Pune";

        try {
            // Weather data refresh karo
            await getWeather(savedCity);

            // ✅ CANVAS ANIMATION BHI REFRESH KARO
            setTimeout(() => {
                initSkyAnimation('temprature', currentIsDay);
                console.log("🔄 Auto Refresh + Canvas Update:", savedCity);
            }, 100);

        } catch (error) {
            console.log("❌ Auto refresh failed:", error);
        }

    }, 300000); // 300000 = 5 minutes
});


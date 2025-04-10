// ==UserScript==
// @name         Tableros SI
// @namespace    http://tampermonkey.net/
// @version      1.21
// @description  Rotar enlaces con opción de pausa y reanudación mediante botones visibles, con contador de tiempo fluido.
// @author       Tú
// @match        https://app.powerbi.com/*
// @updateURL    https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20SI.js
// @downloadURL  https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20SI.js
// ==/UserScript==
(function() {
    'use strict';
const MAIL_WEBHOOK_URL = "https://formspree.io/f/mrbpoyzl";
    const links = [
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/79f67593-bef4-4cdf-a865-11e92d41571b/ReportSection?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/ed2cbcaa-412f-435c-ac52-09e551358ef3/ReportSectione3fddb13c59f7baed531?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/me/reports/82b9efd6-ed22-472f-95e9-336547f995f1/7494775d5c4c11eddb1d?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/10a2d2c5-0dd0-45c6-99f1-b96fd4aa3fef/555f899c2780a87ca5dc?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/f287e911-8ce7-4bf8-ad45-5cb38d92d200/ReportSection?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/7e9d3785-efd4-4ba6-86b2-e6890eaf9efc/ReportSection020b3c6bb1de02141e39?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/f287e911-8ce7-4bf8-ad45-5cb38d92d200/b5bd8e46e075bd79e5c2?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/481e7a55-3d56-4b5f-a736-de466a672cb7/3f59c63e62ec2e696753?experience=power-bi&chromeless=true" // geolocalizacion
    
];
// URLs 

    const blacklistKey = 'NoSeVisualiza';
    function getBlacklist() {
        return JSON.parse(localStorage.getItem(blacklistKey) || '[]');
    }

    function addToBlacklist(url) {
        const list = getBlacklist();
        if (!list.includes(url)) {
            list.push(url);
            localStorage.setItem(blacklistKey, JSON.stringify(list));
            console.warn("URL agregada a NoSeVisualiza:", url);
        }
    }

    function showBlacklist() {
        const list = getBlacklist();
        const content = list.length
            ? list.map((url, i) => `${i + 1}. ${url}`).join('\n')
            : "No hay tableros rotos registrados.";

        const popup = window.open('', 'TablerosRotos', 'width=800,height=500');
        popup.document.write(`
            <html>
            <head>
                <title>Tableros rotos</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        color: #333;
                    }
                    h2 {
                        margin-top: 0;
                        color: #0078d7;
                    }
                    textarea {
                        width: 100%;
                        height: 300px;
                        padding: 10px;
                        font-size: 14px;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        resize: none;
                    }
                    .button-container {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 10px;
                    }
                    button {
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        font-size: 14px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #c82333;
                    }
                </style>
            </head>
            <body>
                <h2>Tableros no visualizables</h2>
                <textarea readonly>${content}</textarea>
                <div class="button-container">
                    <button onclick="localStorage.setItem('${blacklistKey}', '[]'); alert('Lista limpiada'); location.reload();">Limpiar lista</button>
                </div>
            </body>
            </html>
        `);
    }

    const validLinks = linksOriginal.filter(url => !getBlacklist().includes(url));
    const currentUrl = window.location.href;
    if (!validLinks.includes(currentUrl)) {
        console.log("Script no se ejecuta en esta página válida.");
        rotateToNext();
        return;
    }

    const rotationTime = { seconds: 0, minutes: 10, hours: 0 };
    const delay = (rotationTime.seconds || 0) * 1000 +
        (rotationTime.minutes || 0) * 60 * 1000 +
        (rotationTime.hours || 0) * 60 * 60 * 1000;

    let index = validLinks.indexOf(currentUrl);
    let timer = null;
    let paused = false;
    let remainingTime = delay;
    let lastPausedTime = 0;
    let startTime = 0;

    function sendMail(asunto, mensaje) {
    fetch("https://script.google.com/macros/s/AKfycbzHTh0HYoujqgfj2N0iJXpHpYaKvFVpC7C1QeURWVN7ETHfg6R-jYIwSvrWYNOjB3gdWg/exec", {
        method: "POST",
        mode: "no-cors",

        body: JSON.stringify({
            tipo: "errorTablero",
            mensaje: `${asunto} - ${mensaje}`,
            url: window.location.href
        })
    })
    .then(() => console.log("📩 Mail de tablero roto enviado por Apps Script"))
    .catch(err => console.error("❌ Error al enviar mail por Apps Script:", err));
}


    function rotateToNext() {
        clearInterval(timer);
        const updatedList = linksOriginal.filter(url => !getBlacklist().includes(url));
        if (updatedList.length === 0) {
            console.warn("No quedan tableros para mostrar.");
            return;
        }
        index = (index + 1) % updatedList.length;
        localStorage.setItem('rotateIndex', index);
        window.location.href = updatedList[index];
    }

    function startTimer() {
        paused = false;
        setButtonActive(resumeButton, stopButton);
        startTime = lastPausedTime ? Date.now() - (delay - lastPausedTime) : Date.now();
        updateTimerDisplay();
        timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            remainingTime = delay - elapsedTime;
            if (remainingTime <= 0) rotateToNext();
            else updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        paused = true;
        setButtonActive(stopButton, resumeButton);
        clearInterval(timer);
        lastPausedTime = remainingTime;
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const secondsLeft = Math.max(Math.floor(remainingTime / 1000), 0);
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function setButtonActive(active, inactive) {
        active.style.backgroundColor = '#0056b3';
        active.style.color = '#fff';
        inactive.style.backgroundColor = '#0078d7';
        inactive.style.color = '#e0e0e0';
    }

    function createButton(text, onClick, size = "normal", isRound = false) {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.style.padding = size === "small" ? '8px' : '15px 30px';
        button.style.fontSize = size === "small" ? '14px' : '16px';
        button.style.margin = '0 10px';
        button.style.background = '#0078d7';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.borderRadius = isRound ? '50%' : '5px';
        button.style.transition = 'background 0.3s, transform 0.2s';
        button.style.width = isRound ? '40px' : 'auto';
        button.style.height = isRound ? '40px' : 'auto';
        button.onmouseover = () => button.style.backgroundColor = '#0057c7';
        button.onmouseout = () => button.style.backgroundColor = '#0078d7';
        button.onmousedown = () => button.style.transform = 'scale(0.95)';
        button.onmouseup = () => button.style.transform = 'scale(1)';
        button.onclick = onClick;
        return button;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    document.body.appendChild(container);

    const stopButton = createButton('Detener', stopTimer);
    const resumeButton = createButton('Reanudar', startTimer);
    container.appendChild(resumeButton);
    container.appendChild(stopButton);

    const configButton = createButton('⚙️', showBlacklist, 'small', true);
    configButton.style.position = 'fixed';
    configButton.style.top = '20px';
    configButton.style.right = '20px';
    configButton.style.zIndex = '10000';
    document.body.appendChild(configButton);

    const timerContainer = document.createElement('div');
    timerContainer.style.position = 'fixed';
    timerContainer.style.top = '20px';
    timerContainer.style.left = '20px';
    timerContainer.style.backgroundColor = '#e0f7ff';
    timerContainer.style.borderRadius = '12px';
    timerContainer.style.padding = '10px 15px';
    timerContainer.style.zIndex = '9999';
    timerContainer.style.fontSize = '20px';
    timerContainer.style.color = '#333';
    timerContainer.style.fontWeight = 'bold';
    document.body.appendChild(timerContainer);

    const timerDisplay = document.createElement('div');
    timerContainer.appendChild(timerDisplay);

    function checkForErrorMessage() {
        const errorText = "No pudimos encontrar ese informe";
        const elements = [...document.querySelectorAll('div, span, p')];
        const found = elements.some(el => el.textContent?.includes(errorText));
        if (found && !paused) {
            console.warn("Tablero roto detectado");
            addToBlacklist(currentUrl);
            sendMail("Tablero roto", "Este tablero falló y fue omitido.");
            setTimeout(() => rotateToNext(), 2000);
        }
    }


// Guardá última ejecución en localStorage
setInterval(() => {
    localStorage.setItem("ultimo_ping", new Date().toISOString());
}, 60000); // cada 1 minuto

// === Sistema de heartbeat (vida del script) ===
// Ping de vida cada 5 minutos al webhook externo

setInterval(() => {
    fetch("https://script.google.com/macros/s/AKfycbzuHNKvN8sPYoxMhgAmEsfQTBP8nd9CNWlxKZFDk_Eerkox-7suSKPtTQBVq5OmDuem/exec", {
        method: "POST",
        mode: "no-cors", // ← importante para evitar el error de CORS
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            origen: "Tableros GSP",
            timestamp: new Date().toISOString()
        })
    })
    .then(() => console.log("✅ Ping de vida enviado (modo no-cors)"))
    .catch(err => console.error("❌ Error al enviar ping:", err));
}, 0.2 * 60 * 1000); // cada 5 minutos



    setInterval(checkForErrorMessage, 5000);
    setButtonActive(resumeButton, stopButton);
    startTimer();
})();

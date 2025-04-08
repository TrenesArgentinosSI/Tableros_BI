// ==UserScript==
// @name         Tableros Gerencia GSP
// @namespace    http://tampermonkey.net/
// @version      1.31
// @description  Rotar enlaces con opción de pausa y reanudación mediante botones visibles, con contador de tiempo fluido.
// @author       Tú
// @match        https://app.powerbi.com/*
// @updateURL    https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20Gerencia%20GSP.js
// @downloadURL  https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20Gerencia%20GSP.js
// ==/UserScript==
(function() {
    'use strict';

    const links = [
        "https://app.powerbi.com/groups/me/reports/7e9d3785-efd4-4ba6-86b2-e6890eaf9efc/ReportSection020b3c6bb1de02141e39?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi", // resumen ejecutivo
        "https://app.powerbi.com/groups/me/reports/82b9efd6-ed22-472f-95e9-336547f995f1/7494775d5c4c11eddb1d?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi", // portal gsp
        "https://app.powerbi.com/groups/me/reports/79f67593-bef4-4cdf-a865-11e92d41571b/ReportSection?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi", //Riesgos grc 
        "https://app.powerbi.com/groups/me/reports/3d207542-1bcb-4557-a2e1-4a195a66ebef/ReportSection?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi", //status backups
        "https://app.powerbi.com/groups/me/reports/88b3d9cb-4e34-46b3-8f05-4e2776595a03/ReportSection598b87c7344b73973402?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&chromeless=true&experience=power-bi",//detalle backups
        "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/481e7a55-3d56-4b5f-a736-de466a672cb7/3f59c63e62ec2e696753?experience=power-bi&chromeless=true",// geolocalizacio
        "https://app.powerbi.com/groups/647f43d9-54a1-47ee-9e78-604bb84ac9ff/reports/01661e10-0139-4bee-bf88-1b96ba9d7f2e/ReportSection1554dd7e053a66979e0b?experience=powerbi&chromeless=true", //empleados Dotacion
        "https://app.powerbi.com/groups/647f43d9-54a1-47ee-9e78-604bb84ac9ff/reports/01661e10-0139-4bee-bf88-1b96ba9d7f2e/44f3f26abe0a6fb92b24?experience=power-bi&chromeless=true", //Empleados - Altas y bajas
        "https://app.powerbi.com/groups/647f43d9-54a1-47ee-9e78-604bb84ac9ff/reports/01661e10-0139-4bee-bf88-1b96ba9d7f2e/ReportSectionf9fe292b4b0b2244a793?experience=power-bi&chromeless=true", //Edad y Sexo
        "https://app.powerbi.com/groups/647f43d9-54a1-47ee-9e78-604bb84ac9ff/reports/01661e10-0139-4bee-bf88-1b96ba9d7f2e/ReportSection7b34db0f300b875c8c1b?experience=power-bi&chromeless=true", //Antiguedad
        "https://app.powerbi.com/groups/5320e04e-ab1f-4e12-9ab3-230f02c65d17/reports/f542c10d-bc0a-41be-8983-9a6b9f25ccb2/56ad26d522ccc2e3b89c?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&experience=power-bi&chromeless=true", //Recaudaciones 2024
        "https://app.powerbi.com/groups/5320e04e-ab1f-4e12-9ab3-230f02c65d17/reports/f542c10d-bc0a-41be-8983-9a6b9f25ccb2/39641eae0b32fe7ea9da?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&experience=power-bi&chromeless=true" //Recaudaciones 2025
        ];
// URLs 

    // Verificar si la URL actual está en la lista de URLs permitidas
    const currentUrl = window.location.href;

    if (!links.includes(currentUrl)) {
        console.log("Este script no se ejecuta en esta página.");
        return; // Salir si la URL no está permitida
    }

    // Configuración del tiempo (modificable)
    const rotationTime = {
        seconds: 0,
        minutes: 5,
        hours: 0
    };

    // Calcula el tiempo total en milisegundos
    const delay = (rotationTime.seconds || 0) * 1000 +
                  (rotationTime.minutes || 0) * 60 * 1000 +
                  (rotationTime.hours || 0) * 60 * 60 * 1000;

    if (delay <= 0) {
        console.error("Tiempo de rotación no válido. Configura un valor mayor que cero.");
        return;
    }

    let index = parseInt(localStorage.getItem('rotateIndex'), 10) || 0;
    let timer = null;
    let paused = false;
    let remainingTime = delay;
    let lastPausedTime = 0;
    let startTime = 0;

    function startTimer() {
        paused = false;
        setButtonActive(resumeButton, stopButton);

        if (lastPausedTime > 0) {
            startTime = Date.now() - (delay - lastPausedTime);
        } else {
            startTime = Date.now();
        }

        updateTimerDisplay();

        timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            remainingTime = delay - elapsedTime;

            if (remainingTime <= 0) {
                clearInterval(timer);
                index = (index + 1) % links.length;
                localStorage.setItem('rotateIndex', index);
                window.location.href = links[index];
                startTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopTimer() {
        paused = true;
        setButtonActive(stopButton, resumeButton);
        clearInterval(timer);
        lastPausedTime = remainingTime;
        updateTimerDisplay();
    }

    function setButtonActive(activeButton, inactiveButton) {
        activeButton.style.backgroundColor = '#0056b3';
        activeButton.style.color = '#fff';
        inactiveButton.style.backgroundColor = '#0078d7';
        inactiveButton.style.color = '#e0e0e0';
    }

    function updateTimerDisplay() {
        const secondsLeft = Math.max(Math.floor(remainingTime / 1000), 0);
        const minutesLeft = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        timerDisplay.textContent = `${String(minutesLeft).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '15px 30px';
        button.style.background = '#0078d7';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '5px';
        button.style.fontSize = '16px';
        button.style.margin = '0 10px';
        button.style.transition = 'background 0.3s, transform 0.2s';

        button.addEventListener('mouseover', () => {
            if (button.style.backgroundColor !== '#0056b3') {
                button.style.backgroundColor = '#0057c7';
            }
        });
        button.addEventListener('mouseout', () => {
            if (button.style.backgroundColor !== '#0056b3') {
                button.style.backgroundColor = '#0078d7';
            }
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', onClick);
        return button;
    }

    function createButtonContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        document.body.appendChild(container);
        return container;
    }

    function createTimerContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '9999';
        container.style.fontSize = '20px';
        container.style.color = '#333';
        container.style.fontWeight = 'bold';
        document.body.appendChild(container);
        return container;
    }

    const container = createButtonContainer();
    const timerContainer = createTimerContainer();

    const stopButton = createButton('Detener', () => {
        if (!paused) {
            stopTimer();
            console.log('Temporizador detenido');
        }
    });

    const resumeButton = createButton('Reanudar', () => {
        if (paused) {
            startTimer();
            console.log('Temporizador reanudado');
        }
    });

    container.appendChild(resumeButton);
    container.appendChild(stopButton);

    const timerDisplay = document.createElement('div');
    timerContainer.appendChild(timerDisplay);

    setButtonActive(resumeButton, stopButton);
    startTimer();

})();

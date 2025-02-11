// ==UserScript==
// @name         Tableros SI
// @namespace    http://tampermonkey.net/
// @version      1.14
// @description  Rotar enlaces con opción de pausa y reanudación mediante botones visibles, con contador de tiempo fluido.
// @author       Tú
// @match        https://app.powerbi.com/*
// @updateURL    https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20SI.js
// @downloadURL  https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20SI.js
// ==/UserScript==
(function() {
    'use strict';

    const links = [
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/79f67593-bef4-4cdf-a865-11e92d41571b/ReportSection?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/ed2cbcaa-412f-435c-ac52-09e551358ef3/ReportSection2715595b9d97a4393537?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/10a2d2c5-0dd0-45c6-99f1-b96fd4aa3fef/555f899c2780a87ca5dc?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/9965ab01-29dc-4c29-9a61-51eaf662a869/28c660cfb034d209194e?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/8621cbc9-5df9-4822-b32d-aa3c5c54a7bd/3f59c63e62ec2e696753?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/f287e911-8ce7-4bf8-ad45-5cb38d92d200/ReportSection?experience=power-bi&chromeless=true",
    "https://app.powerbi.com/groups/630bc243-2261-4e9d-9739-12919cf2727e/reports/7e9d3785-efd4-4ba6-86b2-e6890eaf9efc/ReportSection020b3c6bb1de02141e39?experience=power-bi&chromeless=true"
    
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

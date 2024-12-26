// ==UserScript==
// @name         Tableros Gerencia GSP
// @namespace    http://tampermonkey.net/
// @version      1.12
// @description  Rotar enlaces con opción de pausa y reanudación mediante botones visibles, con contador de tiempo fluido.
// @author       Tú
// @match        https://app.powerbi.com/*
// @updateURL    https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20Gerencia%20GSP.js
// @downloadURL  https://github.com/TrenesArgentinosSI/Tableros_BI/raw/refs/heads/main/Tableros%20Gerencia%20GSP.js
// ==/UserScript==
(function() {
    'use strict';

    const links = [
"https://app.powerbi.com/links/Ma76FMCl7w?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare&bookmarkGuid=25945810-27a5-424d-abe3-170829e396f9?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/links/zK1Wg0oyeE?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare&bookmarkGuid=9667169b-d46c-4cf1-b045-354ac011ade8?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/links/JDVlq5w5Om?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare&bookmarkGuid=866bb75a-f0dc-41f2-8a56-f7dbaac24f41?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/links/3Oq9_0RLzY?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/links/zk_fpsVM1Y?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare&bookmarkGuid=c36b4544-9896-47b9-bd07-2971663a00fa?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/links/GQsWlyo_kh?ctid=9d6555ab-db4f-4ab0-8e7e-39efc4dc6730&pbi_source=linkShare?experience=power-bi&chromeless=true"
        ];
// URLs permitidas

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
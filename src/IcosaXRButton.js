class XRButton {

    static createButton(renderer, sessionInit = {}, allowAR = true) {

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.zIndex = '999';

        function createXRButton(mode, label) {
            const button = document.createElement('button');
            let currentSession = null;

            async function onSessionStarted(session) {
                session.addEventListener('end', onSessionEnded);
                await renderer.xr.setSession(session);
                button.textContent = `STOP ${label}`;
                currentSession = session;
            }

            function onSessionEnded( /*event*/) {
                currentSession.removeEventListener('end', onSessionEnded);
                button.textContent = `START ${label}`;
                currentSession = null;
            }

            button.style.cursor = 'pointer';
            button.style.width = '100px';
            button.textContent = `START ${label}`;

            const sessionOptions = {
                ...sessionInit,
            };

            button.onmouseenter = function () {
                button.style.opacity = '1.0';
            };

            button.onmouseleave = function () {
                button.style.opacity = '0.5';
            };

            button.onclick = function () {
                if (currentSession === null) {
                    navigator.xr.requestSession(mode, sessionOptions)
                        .then(onSessionStarted);
                } else {
                    currentSession.end();
                    if (navigator.xr.offerSession !== undefined) {
                        navigator.xr.offerSession(mode, sessionOptions)
                            .then(onSessionStarted)
                            .catch((err) => {
                                console.warn(err);
                            });
                    }
                }
            };

            if (navigator.xr.offerSession !== undefined) {
                navigator.xr.offerSession(mode, sessionOptions)
                    .then(onSessionStarted)
                    .catch((err) => {
                        console.warn(err);
                    });
            }

            stylizeElement(button);
            return button;
        }

        function stylizeElement(element) {
            element.style.padding = '12px 6px';
            element.style.border = '1px solid #fff';
            element.style.borderRadius = '4px';
            element.style.background = 'rgba(0,0,0,0.1)';
            element.style.color = '#fff';
            element.style.font = 'normal 13px sans-serif';
            element.style.textAlign = 'center';
            element.style.opacity = '0.5';
            element.style.outline = 'none';
        }

        if ('xr' in navigator) {

            const promises = [];

            if (allowAR) {
                promises.push(
                    navigator.xr.isSessionSupported('immersive-ar')
                        .then(supported => ({ mode: 'immersive-ar', supported, label: 'AR' }))
                        .catch(() => ({ mode: 'immersive-ar', supported: false, label: 'AR' }))
                );
            }

            promises.push(
                navigator.xr.isSessionSupported('immersive-vr')
                    .then(supported => ({ mode: 'immersive-vr', supported, label: 'VR' }))
                    .catch(() => ({ mode: 'immersive-vr', supported: false, label: 'VR' }))
            );

            Promise.all(promises).then(results => {
                let supportedModes = results.filter(r => r.supported);

                // For debugging
                // if (supportedModes.length === 0 || true) {
                //     supportedModes.push({mode: 'immersive-vr', supported: true, label: 'VR'});
                //     supportedModes.push({mode: 'immersive-ar', supported: true, label: 'AR'});
                // }

                if (supportedModes.length === 0) {
                    const message = document.createElement('div');
                    message.textContent = 'No headset found';
                    message.style.cursor = 'auto';
                    message.style.width = '150px';
                    message.style.display = 'none';
                    stylizeElement(message);
                    container.appendChild(message);
                } else {
                    supportedModes.forEach(({ mode, label }) => {
                        const button = createXRButton(mode, label);
                        container.appendChild(button);
                    });
                }
            });

            return container;

        } else {

            const message = document.createElement('a');

            if (window.isSecureContext === false) {

                message.href = document.location.href.replace(/^http:/, 'https:');
                message.innerHTML = 'WEBXR NEEDS HTTPS';

            } else {

                message.style.display = 'none';
            }

            message.style.width = '180px';
            message.style.textDecoration = 'none';

            stylizeElement(message);
            container.appendChild(message);

            return container;
        }
    }
}

export {XRButton};

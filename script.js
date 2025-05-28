document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const darkRed = '#5c0101';
    const black = '#000000';
    const particles = [];
    const waves = [];
    const vortexes = [];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2,
            pulse: Math.random() * 0.05 + 0.02,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }
    for (let i = 0; i < 5; i++) {
        waves.push({
            amplitude: Math.random() * 200 + 50,
            frequency: Math.random() * 0.005 + 0.002,
            speed: Math.random() * 0.001 + 0.0005,
            offset: Math.random() * Math.PI * 2
        });
    }
    for (let i = 0; i < 3; i++) {
        vortexes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 300 + 100,
            speed: Math.random() * 0.001 + 0.0005,
            rotation: Math.random() * 0.001 + 0.0005,
            angle: 0
        });
    }
    function createGradients() {
        const radialGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0, 
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        radialGradient.addColorStop(0, darkRed);
        radialGradient.addColorStop(1, black);
        return { radial: radialGradient };
    }
    function drawWave(wave, time) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            const y = Math.sin((x * wave.frequency) + (time * wave.speed) + wave.offset) * wave.amplitude + canvas.height / 2;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(92, 1, 1, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function drawParticle(particle, time) {
        const pulsatingRadius = particle.radius + Math.sin(time * particle.pulse + particle.pulseOffset) * particle.radius * 0.5;
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        vortexes.forEach(vortex => {
            const dx = vortex.x - particle.x;
            const dy = vortex.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < vortex.radius) {
                const force = 1 - (distance / vortex.radius);
                const angle = Math.atan2(dy, dx) + Math.PI / 2 + vortex.angle;
                particle.x += Math.cos(angle) * force * 0.5;
                particle.y += Math.sin(angle) * force * 0.5;
            }
        });
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulsatingRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, pulsatingRadius
        );
        gradient.addColorStop(0, darkRed);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function drawVortex(vortex, time) {
        vortex.angle += vortex.rotation;
        vortex.x += Math.cos(time * vortex.speed) * 0.5;
        vortex.y += Math.sin(time * vortex.speed * 1.5) * 0.5;
        vortex.x = Math.max(vortex.radius / 3, Math.min(canvas.width - vortex.radius / 3, vortex.x));
        vortex.y = Math.max(vortex.radius / 3, Math.min(canvas.height - vortex.radius / 3, vortex.y));
        const gradient = ctx.createRadialGradient(
            vortex.x, vortex.y, 0,
            vortex.x, vortex.y, vortex.radius
        );
        gradient.addColorStop(0, 'rgba(92, 1, 1, 0.2)');
        gradient.addColorStop(0.7, 'rgba(92, 1, 1, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, vortex.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function animate() {
        const time = Date.now() * 0.001;
        const gradients = createGradients();
        ctx.fillStyle = black;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.2) * 0.1;
        ctx.fillStyle = gradients.radial;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        waves.forEach(wave => drawWave(wave, time));
        vortexes.forEach(vortex => drawVortex(vortex, time));
        particles.forEach(particle => drawParticle(particle, time));
        ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + Math.sin(time * 0.5) * 0.05})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `rgba(92, 1, 1, ${0.1 + Math.sin(time * 0.3) * 0.05})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const offset = i * Math.PI / 5;
            ctx.beginPath();
            for (let j = 0; j < canvas.width; j += 20) {
                const x = j;
                const y = Math.sin(j * 0.01 + time + offset) * 100 + canvas.height / 2;
                if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        requestAnimationFrame(animate);
    }
    animate();
});

const loaderScreen = document.getElementById('loader');
const bgCanvas = document.getElementById('bgCanvas');
const music = document.getElementById('background-music');
const sadMusic = document.getElementById('sad-music');
const countdownEl = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdown-number');

let activeSlideId = ''; 
let audioTransitionInProgress = false;
const FADE_DURATION = 1500;
const TARGET_AUDIO_VOLUME = 0.7;


function fadeAudio(audio, targetVolume, duration, callback) {
    if (!audio) {
        if (callback) callback();
        return;
    }
    const stepTime = 50;
    const steps = Math.max(1, duration / stepTime);
    const initialVolume = audio.volume;
    const volumeStep = (targetVolume - initialVolume) / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
        currentStep++;
        let newVolume = initialVolume + (volumeStep * currentStep);

        if (targetVolume > initialVolume) {
            newVolume = Math.min(targetVolume, newVolume);
        } else {
            newVolume = Math.max(targetVolume, newVolume);
        }
        newVolume = Math.max(0, Math.min(1, newVolume));

        audio.volume = newVolume;

        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            audio.volume = targetVolume;
            if (callback) callback();
        }
    }, stepTime);
}


function simulateLoading() {
    setTimeout(() => {
        loaderScreen.style.opacity = '0';
        setTimeout(() => {
            loaderScreen.style.display = 'none';
            bgCanvas.style.opacity = '1';
            setTimeout(() => {
                showSlide('slide-1'); 
            }, 500);
        }, 1000);
    }, 3000);
}

window.addEventListener('load', simulateLoading);

function showSlide(slideId) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
        const mb = slide.querySelector('.message-box');
        const bc = slide.querySelector('.button-container');
        const ic = slide.querySelector('.image-container');
        if (mb) mb.classList.remove('visible');
        if (bc) bc.classList.remove('visible');
        if (ic) ic.classList.remove('visible');
    });
    
    const currentSlide = document.getElementById(slideId);
    if (!currentSlide) {
        console.error("Slide not found:", slideId);
        return;
    }
    currentSlide.classList.add('active');
    activeSlideId = slideId; 
    
    const messageBox = currentSlide.querySelector('.message-box');
    const buttonContainer = currentSlide.querySelector('.button-container');
    const imageContainer = currentSlide.querySelector('.image-container');
    
    setTimeout(() => {
        if (imageContainer) {
            imageContainer.classList.add('visible');
        }
        setTimeout(() => {
            if (messageBox) {
                messageBox.classList.add('visible');
            }
        }, imageContainer ? 200 : (messageBox ? 0 : 0) ); 
        const primaryContentDelay = (imageContainer || messageBox) ? 500 : 0;
        setTimeout(() => {
            if (buttonContainer) {
                buttonContainer.classList.add('visible');
            }
        }, primaryContentDelay);
    }, 300);
}

function nextSlide(logicalStepOrContext, option = null) {
    if (audioTransitionInProgress && 
        !(logicalStepOrContext === 1 && option === null && !music.paused) &&
        !(activeSlideId === 'slide-7-no' && (option === 'no-yes' || option === 'no-no'))
    ) {
        if(activeSlideId !== 'slide-1' && activeSlideId !== 'slide-7-no') {
            console.log("Audio transition in progress, slide change blocked.");
        }
    }

    const slideToAnimateOut = document.getElementById(activeSlideId);
    if (slideToAnimateOut) {
        const messageBox = slideToAnimateOut.querySelector('.message-box');
        const buttonContainer = slideToAnimateOut.querySelector('.button-container');
        const imageContainer = slideToAnimateOut.querySelector('.image-container');
        
        if (messageBox) messageBox.classList.remove('visible');
        if (buttonContainer) buttonContainer.classList.remove('visible');
        if (imageContainer) imageContainer.classList.remove('visible');
    }
    
    let nextSlideIdToShow;
    
    switch (logicalStepOrContext) {
        case 1: nextSlideIdToShow = 'slide-2'; break;
        case 2: nextSlideIdToShow = 'slide-3'; break;
        case 3: nextSlideIdToShow = 'slide-4'; break;
        case 4: nextSlideIdToShow = 'slide-5'; break;
        case 6: 
            if (option === 'yes') nextSlideIdToShow = 'slide-7-yes';
            else if (option === 'no') nextSlideIdToShow = 'slide-7-no';
            break;
        case 7: 
            if (activeSlideId === 'slide-7-yes' && option === 'yes') { 
                nextSlideIdToShow = 'slide-8-yes';
            } else if (activeSlideId === 'slide-7-no') { 
                if (option === 'no-yes') nextSlideIdToShow = 'slide-8-no-yes'; 
                else if (option === 'no-no') nextSlideIdToShow = 'slide-6'; 
            }
            break;
        default:
            console.warn("Unhandled logicalStepOrContext in nextSlide:", logicalStepOrContext, option);
            return; 
    }

    if (logicalStepOrContext === 1 && option === null) {
        if (audioTransitionInProgress) return;
        audioTransitionInProgress = true;

        const startMainMusic = () => {
            if (music.paused) {
                 music.volume = 0;
                 music.play().catch(e => console.error('Music play error:', e));
            }
            fadeAudio(music, TARGET_AUDIO_VOLUME, FADE_DURATION, () => {
                audioTransitionInProgress = false;
            });
        };

        if (!sadMusic.paused && sadMusic.volume > 0) {
            fadeAudio(sadMusic, 0, FADE_DURATION, () => {
                sadMusic.pause();
                sadMusic.currentTime = 0;
                startMainMusic();
            });
        } else {
            startMainMusic();
        }

    } else if (activeSlideId === 'slide-7-no' && option === 'no-yes' && nextSlideIdToShow === 'slide-8-no-yes') {
        if (audioTransitionInProgress) return;
        audioTransitionInProgress = true;
        fadeAudio(music, 0, FADE_DURATION, () => {
            music.pause();
            
            sadMusic.currentTime = 0;
            sadMusic.volume = 0;
            sadMusic.play().catch(e => console.error('Sad music play error:', e));
            fadeAudio(sadMusic, TARGET_AUDIO_VOLUME, FADE_DURATION, () => {
                audioTransitionInProgress = false;
            });
        });
    } else if (activeSlideId === 'slide-7-no' && option === 'no-no' && nextSlideIdToShow === 'slide-6') {
        if (audioTransitionInProgress) return;
        audioTransitionInProgress = true;
        fadeAudio(sadMusic, 0, FADE_DURATION, () => {
            sadMusic.pause();
            sadMusic.currentTime = 0;

            if (music.paused) {
                music.volume = 0;
                music.play().catch(e => console.error('Music play error:', e));
            }
            fadeAudio(music, TARGET_AUDIO_VOLUME, FADE_DURATION, () => {
                audioTransitionInProgress = false;
            });
        });
    }
    
    if (nextSlideIdToShow) {
        setTimeout(() => {
            showSlide(nextSlideIdToShow);
        }, 800); 
    }
}

function startCountdown() {
    const currentSlide = document.getElementById('slide-5'); 
    const messageBox = currentSlide.querySelector('.message-box');
    const buttonContainer = currentSlide.querySelector('.button-container');
    
    if (messageBox) messageBox.classList.remove('visible');
    if (buttonContainer) buttonContainer.classList.remove('visible');
    
    setTimeout(() => {
        currentSlide.classList.remove('active');
        
        countdownEl.classList.add('active');
        countdownNumber.style.opacity = '0'; 
        countdownNumber.style.transform = 'scale(0.8)'; 
        
        let count = 5;
        
        setTimeout(() => {
            countdownNumber.textContent = count;
            countdownNumber.style.opacity = '1';
            countdownNumber.style.transform = 'scale(1)';
        }, 100);

        const countdownInterval = setInterval(() => {
            count--;
            
            if (count >= 1) { 
                countdownNumber.style.opacity = '0';
                countdownNumber.style.transform = 'scale(1.2)'; 
                
                setTimeout(() => {
                    countdownNumber.textContent = count;
                    countdownNumber.style.opacity = '1';
                    countdownNumber.style.transform = 'scale(1)'; 
                }, 300); 
            } else { 
                clearInterval(countdownInterval);
                
                countdownNumber.style.opacity = '0';
                countdownNumber.style.transform = 'scale(1.2)';
                
                setTimeout(() => {
                    countdownEl.classList.remove('active');
                    
                    setTimeout(() => {
                        showSlide('slide-6'); 
                    }, 500); 
                }, 500); 
            }
        }, 1000 + 300); 
    }, 800); 
}
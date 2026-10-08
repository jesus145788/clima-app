const API_KEY = '22e49ac2e704a1824224c4280c54d3f8';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const formulario = document.getElementById('formulario');
const inputCiudad = document.getElementById('inputCiudad');
const resultado = document.getElementById('resultado');
const estado = document.getElementById('estado');
const btnUbicacion = document.getElementById('btnUbicacion');
const btnTema = document.getElementById('btnTema');
const historialBotones = document.getElementById('historialBotones');
const pronosticoContenedor = document.getElementById('pronosticoContenedor');
const pronosticoTarjetas = document.getElementById('pronosticoTarjetas');

async function consultarClima(ciudad) {
    estado.textContent = '⏳ Consultando el clima...';
    resultado.classList.remove('visible');
    pronosticoContenedor.classList.remove('visible');

    try {
        const ciudadCodificada = encodeURIComponent(ciudad);
        const url = `${API_URL}?q=${ciudadCodificada}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            if (respuesta.status === 404) throw new Error('Ciudad no encontrada');
            else if (respuesta.status === 401) throw new Error('API Key inválida');
            else throw new Error('Error en la petición: ' + respuesta.status);
        }

        const datos = await respuesta.json();
        mostrarClima(datos);
        guardarEnHistorial(datos.name);
        consultarPronostico(ciudadCodificada);
        estado.textContent = '✅ Datos actualizados correctamente.';

    } catch (error) {
        console.error('Error:', error);
        estado.textContent = `❌ ${error.message}. Intenta con otra ciudad.`;
        resultado.classList.remove('visible');
    }
}

async function consultarClimaPorCoordenadas(lat, lon) {
    estado.textContent = '⏳ Obteniendo clima de tu ubicación...';
    resultado.classList.remove('visible');
    pronosticoContenedor.classList.remove('visible');

    try {
        const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        mostrarClima(datos);
        guardarEnHistorial(datos.name);
        consultarPronosticoPorCoordenadas(lat, lon);
        estado.textContent = '✅ Clima de tu ubicación actual.';
    } catch (error) {
        estado.textContent = '❌ Error al obtener el clima de tu ubicación.';
    }
}

async function consultarPronostico(ciudadCodificada) {
    try {
        const url = `${FORECAST_URL}?q=${ciudadCodificada}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        mostrarPronostico(datos);
    } catch (error) {
        console.error('Error en pronóstico:', error);
    }
}

async function consultarPronosticoPorCoordenadas(lat, lon) {
    try {
        const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        mostrarPronostico(datos);
    } catch (error) {
        console.error('Error en pronóstico:', error);
    }
}

function mostrarClima(datos) {
    const ciudad = datos.name;
    const pais = datos.sys.country;
    const temperatura = Math.round(datos.main.temp);
    const sensacion = Math.round(datos.main.feels_like);
    const humedad = datos.main.humidity;
    const presion = datos.main.pressure;
    const viento = datos.wind.speed;
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;
    const iconoUrl = `https://openweathermap.org/img/wn/${icono}@2x.png`;

    const mensajeWA = encodeURIComponent(`El clima actual en ${ciudad} es de ${temperatura}°C con ${descripcion}.`);
    const linkWhatsApp = `https://wa.me/?text=${mensajeWA}`;

    resultado.innerHTML = `
        <div class="ciudad">${ciudad}</div>
        <div class="pais">${pais}</div>
        <img src="${iconoUrl}" alt="${descripcion}" class="icono-clima">
        <div class="temperatura">${temperatura} °C</div>
        <div class="descripcion">${descripcion}</div>
        <div class="detalles">
            <div class="detalle">
                <div class="etiqueta">Sensación</div>
                <div class="valor">${sensacion}°C</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Humedad</div>
                <div class="valor">${humedad}%</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Presión</div>
                <div class="valor">${presion} hPa</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Viento</div>
                <div class="valor">${viento} m/s</div>
            </div>
        </div>
        <a href="${linkWhatsApp}" target="_blank" class="btn-whatsapp">📲 Compartir en WhatsApp</a>
    `;

    resultado.classList.add('visible');
    cambiarFondoSegunClima(datos.weather[0].main);
}

function mostrarPronostico(datos) {
    pronosticoTarjetas.innerHTML = '';
    
    const listaMediodia = datos.list.filter(item => item.dt_txt.includes('12:00:00'));

    listaMediodia.forEach(item => {
        const fecha = new Date(item.dt * 1000).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp);
        const icono = item.weather[0].icon;
        const iconoUrl = `https://openweathermap.org/img/wn/${icono}.png`;

        pronosticoTarjetas.innerHTML += `
            <div class="pronostico-tarjeta">
                <div class="fecha">${fecha}</div>
                <img src="${iconoUrl}" alt="icono">
                <div class="temp">${temp}°C</div>
            </div>
        `;
    });

    pronosticoContenedor.classList.add('visible');
}

function cambiarFondoSegunClima(clima) {
    document.body.classList.remove('clima-soleado', 'clima-nublado', 'clima-lluvioso', 'clima-nieve');

    const climaLower = clima.toLowerCase();
    if (climaLower.includes('clear')) {
        document.body.classList.add('clima-soleado');
    } else if (climaLower.includes('cloud')) {
        document.body.classList.add('clima-nublado');
    } else if (climaLower.includes('rain') || climaLower.includes('drizzle') || climaLower.includes('thunderstorm')) {
        document.body.classList.add('clima-lluvioso');
    } else if (climaLower.includes('snow')) {
        document.body.classList.add('clima-nieve');
    }
}

function guardarEnHistorial(ciudad) {
    let historial = JSON.parse(localStorage.getItem('historial')) || [];
    if (!historial.includes(ciudad)) {
        historial.unshift(ciudad);
        if (historial.length > 5) historial.pop();
        localStorage.setItem('historial', JSON.stringify(historial));
    }
    renderizarHistorial();
}

function renderizarHistorial() {
    let historial = JSON.parse(localStorage.getItem('historial')) || [];
    historialBotones.innerHTML = '';
    historial.forEach(ciudad => {
        const btn = document.createElement('button');
        btn.textContent = ciudad;
        btn.className = 'btn-historial';
        btn.onclick = () => consultarClima(ciudad);
        historialBotones.appendChild(btn);
    });
}

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const ciudad = inputCiudad.value.trim();
    if (ciudad) consultarClima(ciudad);
});

btnUbicacion.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((posicion) => {
            consultarClimaPorCoordenadas(posicion.coords.latitude, posicion.coords.longitude);
        }, () => {
            estado.textContent = '❌ No se pudo obtener permiso de ubicación.';
        });
    } else {
        estado.textContent = '❌ Tu navegador no soporta geolocalización.';
    }
});

btnTema.addEventListener('click', () => {
    document.body.classList.toggle('claro');
    btnTema.textContent = document.body.classList.contains('claro') ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
});

renderizarHistorial();

estado.textContent = 'Escribe una ciudad y presiona "Consultar".';
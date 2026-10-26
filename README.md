# Localizador de Activos vía Phishing Simulado y MITM con Antena 2G

## De qué va esto

La idea del proyecto es simple: muchas veces necesitas ubicar un dispositivo o verificar la posición real de una persona en un contexto autorizado, y los métodos tradicionales se quedan cortos. Aquí se ataca justo ese punto débil que tiene todo el mundo: el login.

## Como funciona

1. Se genera un portal de inicio de sesión clonado de una red social conocida.
2. Se le manda el link al objetivo, enmascarado y disfrazado como una "verificación de seguridad". El pretexto es que la plataforma detectó un intento de acceso desde otra ubicación y necesita confirmar dónde está realmente el usuario.
3. Cuando la víctima abre el portal, se captura su IP, geolocalización aproximada, dispositivo y demás metadatos útiles.
4. Todo eso se registra en la base de datos y se muestra en tiempo real en la terminal del operador autorizado.

## Lo que viene después

La siguiente fase es integrar el sistema con una fentocelda montada en Raspberry Pi. El objetivo es poder rastrear dispositivos móviles reportados como robados, o personas en situaciones de riesgo donde el nivel de prioridad de búsqueda es alto. O sea, pasar de depender solo de la IP a tener capacidades de intercepción de señales más directas.

## Aviso legal

>Esto es una herramienta ofensiva construida para pruebas de seguridad autorizadas. Usarla fuera de un marco legal, contra gente que no autorizó la prueba o con intención de causar daño, es delito y le corresponde responder a la autoridad competente. El responsable del uso eres tú.

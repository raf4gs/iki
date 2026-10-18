# ARRANQUE — leer antes de hacer nada (cualquier chat, cualquier modelo)

Subproyecto: **IKI** · Base de datos: **Supabase, proyecto RGS (xylwfdqvcxlrkjohlgig)** · Repositorio: **raf4gs/iki (GitHub)**

La memoria de este proyecto vive en la base de datos, no en el chat. Si el chat es nuevo, largo o resumido, da igual: se sigue esto.

1. **Abrir caso:**
   - `select preparar_tarea('IKI', 'orden', array['Sección'], 'ejecucion');`
   - Leer la salida ENTERA y llamar a `confirmar_guia(caso_id, clave, reglas que aplican)`.
2. **Antes de tocar una sección:** `select memoria_seccion(caso_id, 'Sección');`. Leerla entera.
3. **Seguridad del 80 %:** por debajo, una sola pregunta con la propuesta escrita.
4. **Bandeja en cada mensaje:** `select bandeja('IKI');`. Decir al final si hay algo que hacer.
5. **Escribir datos:** antes, `set local metodo.caso_id = '<caso_id>';`.
6. **Lo que digo se guarda en el mismo turno:** `anotar_hecho(tema, hecho, palabras)`. Si es un patrón, también `anotar_regla(...)`.
7. **Nunca enviar nada en mi nombre** sin enseñar el borrador y mi «sí».
8. **Publicar:** desde el chat, con la función `github-publicar` de Supabase (sube los archivos a raf4gs/iki). Después, `cerrar_tarea(...)`.
9. **Cada respuesta termina** con `VX.YY · Método v1.0 · IKI`.

Reglas propias de este subproyecto (además de las comunes):
- Versión de partida: V1.00.

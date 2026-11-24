# ADR-013 — La app pasa a llamarse Linkedu

- **Fecha:** 2026-11-19
- **Estado:** aceptada (decisión del autor)

## Contexto
El autor del TFC decidió cambiar el nombre de la app de **StudyHub** a **Linkedu** (de *link*, enlazar, y *edu*, educación).

## Decisión
- En todo lo que ve el usuario la app se llama **Linkedu**: título de la pestaña, logotipo, textos de registro, portada, mensajes del backend (bienvenida, avisos, nombre de la API) y datos de prueba nuevos.
- Logotipo: **«lu»** en Bricolage Grotesque con la franja de fosforito debajo, y **linkedu** en minúsculas. En el texto, siempre **Linkedu**.
- **No** cambian los nombres internos. Si cambiaran, se cerraría la sesión de todo el mundo, se perdería el tema y el idioma elegidos y habría que migrar la base de datos. Se quedan como están:
  - las claves del navegador (`studyhub_token`, `studyhub_theme`, `studyhub_lang`);
  - el nombre de los registros del backend (`logging.getLogger("studyhub")`);
  - la base de datos y el usuario `studyhub` de Docker;
  - las cuentas de prueba (`@demo.studyhub`);
  - las carpetas del repositorio y la skill `studyhub-ui`.

## Riesgo que se acepta
«Linkedu» se parece mucho a **LinkedIn**, que es una marca registrada del mismo sector (red profesional). Para un TFC no es un problema. Si la app se publicara de verdad, habría que comprobar el registro de marcas (OEPM/EUIPO) o elegir otro nombre. También choca con el objetivo de [[decisiones/ADR-011-estetica-pizarra-fosforito]] de no parecerse a LinkedIn. Por eso la estética mantiene sus diferencias: el lomo, la pizarra y el fosforito, sin azul y sin botones en píldora.

## Consecuencias
- Los datos ya guardados en la base de datos (por ejemplo, el grupo «Gamers StudyHub» o el «Equipo StudyHub») mantienen su nombre hasta que se vuelva a sembrar una base de datos nueva.

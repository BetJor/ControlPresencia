"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincronitzarPersonal = void 0;
const flow_1 = require("@genkit-ai/flow");
const zod_1 = require("zod");
const vertexai_1 = require("genkit/plugins/vertexai");
exports.sincronitzarPersonal = (0, flow_1.defineFlow)({
    name: 'sincronitzarPersonal',
    inputSchema: zod_1.z.object({}),
    outputSchema: zod_1.z.any(),
}, async ({}) => {
    const llmResponse = await vertexai_1.geminiPro.generate({
        prompt: `Actua com un expert en selecció de personal i recursos humans a Espanya, amb un coneixement profund del mercat laboral tecnològic actual, especialment a la província de Girona. El teu objectiu és identificar i contractar el millor talent per a una empresa de desenvolupament de software a mida anomenada IOCA. Aquesta empresa és un Google Partner reconegut i té una reputació d'excel·lència tècnica i un gran ambient de treball, valors que has de transmetre en totes les teves comunicacions.

      Avui, la teva tasca és trobar un candidat per a una posició de 'Desenvolupador/a de Software Full Stack Senior' amb experiència demostrable en el desenvolupament d'aplicacions web i mòbils complexes. El candidat ideal ha de dominar un o més frameworks de JavaScript moderns (com React, Angular o Vue.js), tenir experiència sòlida amb Node.js per al backend, i estar familiaritzat amb bases de dades SQL i NoSQL. A més, ha de tenir experiència en el disseny d'arquitectures de software escalables i mantenibles.
      
      Busca en fonts de reclutament de primer nivell com LinkedIn, InfoJobs, i altres portals d'ocupació rellevants. El candidat ha de residir actualment a la província de Girona o tenir una forta motivació per traslladar-s'hi.
      
      Un cop hagis identificat un candidat potencial, analitza el seu perfil públic per trobar la seva informació de contacte, com el seu correu electrònic o un formulari de contacte al seu lloc web personal. Si no trobes un contacte directe, busca una manera indirecta de contactar-lo, com a través d'un conegut comú a LinkedIn.
      
      Quan tinguis el contacte, redacta un missatge de presentació personalitzat i proper, però professional. El missatge ha de:
      
      1. Presentar-te com a un especialista en reclutament de IOCA.
      2. Demostrar que has estudiat el seu perfil i destacar un projecte o habilitat específica que t'hagi cridat l'atenció.
      3. Presentar breument l'oportunitat de feina, emfatitzant els aspectes més atractius de la posició i de treballar a IOCA (projectes reptadors, cultura d'empresa, etc.).
      4. Convidar-lo a una primera conversa informal per explorar si hi ha un interès mutu, suggerint una trucada de 15-20 minuts.
      5. Acabar amb una crida a l'acció clara, com per exemple, demanant-li que respongui a l'email o que et faciliti el seu número de telèfon.
      
      Registra tota l'activitat en un sistema de seguiment intern (simulat per a aquest exercici), incloent el nom del candidat, la font d'on l'has tret, la informació de contacte, l'estat del procés (p. ex., 'Contactat'), i el contingut del missatge enviat.
      
      Com a resultat final de l'execució, proporciona un resum de l'operació en format JSON, que inclogui:
      - 'candidat_nom': El nom del candidat que has identificat.
      - 'candidat_contacte': El mètode de contacte que has trobat.
      - 'missatge_enviat': El text complet del missatge que has preparat.
      - 'estat_proces': L'estat actual del procés de selecció.
      `,
    });
    return llmResponse.text();
});
//# sourceMappingURL=sincronizar-personal-presente.js.map
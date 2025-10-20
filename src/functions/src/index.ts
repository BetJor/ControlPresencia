import * as functions from 'firebase-functions';
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall } from "firebase-functions/v2/https";
import fetch from "node-fetch";

initializeApp();

// Funció que s'executa quan la crida Cloud Scheduler
exports.importarUsuarisAGoogleWorkspace = functions
  .region('europe-west1') // Canvia a la teva regió
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .pubsub.schedule('every 24 hours') // Programació: cada 24 hores
  .onRun(async (context) => {
    console.log(
      "Iniciant la importació d'usuaris de Google Workspace a Firestore."
    );

    try {
      // Autenticació amb l'API de Google
      const auth = new google.auth.GoogleAuth({
        scopes: [
          'https://www.googleapis.com/auth/admin.directory.user.readonly',
        ],
      });
      const authClient = await auth.getClient();
      google.options({ auth: authClient as any }); // Cast to any to avoid complex type issues

      const admin = google.admin('directory_v1');
      const db = getFirestore();

      let users: any[] = [];
      let nextPageToken: string | null | undefined = null;

      // 1. Obtenir tots els usuaris de Google Workspace (amb paginació)
      do {
        const response: any = await admin.users.list({
          customer: 'my_customer',
          maxResults: 500, // Pots demanar fins a 500 per pàgina
          projection: 'full',
          viewType: 'domain_public',
          orderBy: 'email',
          pageToken: nextPageToken || undefined, // Send undefined if nextPageToken is null
        });

        if (response.data.users) {
          users = users.concat(response.data.users);
        }
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      console.log(`S'han trobat ${users.length} usuaris.`);

      // 2. Processar cada usuari i preparar les dades per Firestore
      const batch = db.batch(); // Utilitzem un batch per a escriptures massives i eficients

      for (const user of users) {
        if (!user.primaryEmail) continue; // Ignorem usuaris sense email

        // Neteja i transformació de dades
        let edifici = 'Sin edificio';
        if (
          user.locations &&
          user.locations[0] &&
          user.locations[0].buildingId
        ) {
          edifici = user.locations[0].buildingId.replace(/-/g, ' ');
        }

        let empresa = null,
          departament = null,
          carrec = null,
          descripcioCarrec = null,
          centreCost = null;
        if (user.organizations && user.organizations.length > 0) {
          const orgData =
            user.organizations.length === 1
              ? user.organizations[0]
              : user.organizations[1] || user.organizations[0];
          empresa = orgData.name;
          departament = orgData.department;
          carrec = orgData.title;
          descripcioCarrec = orgData.description;
          centreCost = orgData.costCenter;

          if (!empresa) {
            if (departament?.includes('ONP')) empresa = 'ONPLUS';
            else if (departament?.includes('BDN')) empresa = 'BDNPLUS';
            else if (departament === 'F.Fihoca') empresa = 'FIHOCA';
            else if (departament === 'SAPAS') empresa = 'SAPAS';
            else if (departament === 'D.DATAPRO') empresa = 'DATAPRO';
            else if (edifici === 'Valencia, 48' || edifici === 'Cerrajeros, 7')
              empresa = 'DATAPRO';
          }
        }

        let telefons: string[] = [];
        if (user.phones && user.phones.length > 0) {
          const phoneSet = new Set<string>();
          for (const p of user.phones) {
            if (p && typeof p.value === 'string' && p.value.length > 0) {
              phoneSet.add(p.value.trim());
            }
          }
          telefons = [...phoneSet];
        }

        const responsable =
          user.relations && user.relations[0] ? user.relations[0].value : null;
        const planta =
          user.locations && user.locations[0]
            ? user.locations[0].floorName
            : null;

        // Creem l'objecte final per a Firestore
        const userData = {
          nom: user.name.givenName || '',
          cognom: user.name.familyName || '',
          email: user.primaryEmail,
          edifici: edifici,
          empresa: empresa || '',
          departament: departament || '',
          carrec: carrec || '',
          descripcioCarrec: descripcioCarrec || '',
          telefons: telefons,
          fotoUrl: user.thumbnailPhotoUrl || '',
          responsable: responsable || '',
          planta: planta || '',
          centreCost: centreCost || '',
          suspès: user.suspended || false,
        };

        // Afegim l'operació al batch
        const userRef = db.collection('directori').doc(user.primaryEmail);
        batch.set(userRef, userData, { merge: true }); // {merge: true} per no sobreescriure camps existents si no cal
      }

      // 3. Executar totes les escriptures a Firestore
      await batch.commit();
      console.log('Importació finalitzada amb èxit!');

      return null;
    } catch (error) {
      console.error("Error durant la importació d'usuaris:", error);
      return null;
    }
  });


exports.getDadesAppSheet = onCall({ region: "europe-west1", memory: "1GiB", timeoutSeconds: 60}, async (request) => {
  // Aquesta funció crida l'API d'AppSheet per obtenir dades.
  const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
  const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj"; // TODO: Guardar-la a secrets!

  const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;

  const body = JSON.stringify({
    "Action": "Find", // Acció per buscar/llegir files
    "Properties": {},
    "Rows": []
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ApplicationAccessKey': APP_ACCESS_KEY
    },
    body: body
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error de l'API d'AppSheet: ${response.status} ${response.statusText}`, errorText);
    throw new functions.https.HttpsError('internal', `Error de l'API d'AppSheet: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // Això retorna les dades al teu client Firebase
});


exports.sincronitzarPersonalPresent = functions
    .region('europe-west1')
    .pubsub.schedule('every 5 minutes')
    .onRun(async (context) => {

    console.log("Iniciant la sincronització de personal present.");

    const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
    const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj";
    const db = getFirestore();

    try {
        // 1. Obtenir fitxatges de AppSheet
        const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;
        const body = JSON.stringify({ "Action": "Find", "Properties": {}, "Rows": [] });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ApplicationAccessKey': APP_ACCESS_KEY
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error de l'API d'AppSheet: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Error de l'API d'AppSheet: ${response.statusText}`);
        }

        const fitxatges: any[] = await response.json() as any[];

        // 2. Calcular usuaris presents
        const usuarisCounts: { [key: string]: number } = {};
        const avui = new Date().toISOString().slice(0, 10);

        for (const fitxatge of fitxatges) {
            const email = fitxatge.USEREMAIL;
            const dataFitxatge = fitxatge["Fecha y Hora"].slice(0, 10);

            if (dataFitxatge === avui) {
                usuarisCounts[email] = (usuarisCounts[email] || 0) + 1;
            }
        }

        const usuarisDinsAppSheet = Object.keys(usuarisCounts)
            .filter(email => usuarisCounts[email] % 2 !== 0);

        // 3. Sincronitzar amb Firestore
        const usuarisDinsFirestoreSnapshot = await db.collection('usuaris_dins').get();
        const usuarisDinsFirestore = usuarisDinsFirestoreSnapshot.docs.map(doc => doc.id);

        const usuarisPerAfegir = usuarisDinsAppSheet.filter(email => !usuarisDinsFirestore.includes(email));
        const usuarisPerEliminar = usuarisDinsFirestore.filter(email => !usuarisDinsAppSheet.includes(email));

        const batch = db.batch();

        for (const email of usuarisPerAfegir) {
            const docRef = db.collection('usuaris_dins').doc(email);
            batch.set(docRef, {}); 
        }

        for (const email of usuarisPerEliminar) {
            const docRef = db.collection('usuaris_dins').doc(email);
            batch.delete(docRef);
        }

        await batch.commit();

        console.log(`Sincronització finalitzada. Afegits: ${usuarisPerAfegir.length}, Eliminats: ${usuarisPerEliminar.length}`);

        return null;

    } catch (error) {
        console.error("Error durant la sincronització de personal present:", error);
        return null;
    }
});


import * as functions from 'firebase-functions';
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';
import fetch from 'node-fetch';

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
      google.options({ auth: authClient as any });

      const admin = google.admin('directory_v1');
      const db = getFirestore();

      let users: any[] = [];
      let nextPageToken: string | null | undefined = null;

      // 1. Obtenir tots els usuaris de Google Workspace (amb paginació)
      do {
        const response: any = await admin.users.list({
          customer: 'my_customer',
          maxResults: 500,
          projection: 'full',
          viewType: 'domain_public',
          orderBy: 'email',
          customFieldMask: 'IOCA',
          pageToken: nextPageToken || undefined,
        });

        if (response.data.users) {
          users = users.concat(response.data.users);
        }
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      console.log(`S'han trobat ${users.length} usuaris.`);

      // 2. Processar cada usuari i preparar les dades per Firestore
      const batch = db.batch();

      for (const user of users) {
        if (!user.primaryEmail || user.suspended) continue;

        // Extreu el P_CI de l'esquema personalitzat
        const pci = user.customSchemas?.IOCA?.P_CI;

        if (!pci || typeof pci !== 'string' || pci.length === 0) {
            console.warn(`L'usuari ${user.primaryEmail} no té un P_CI vàlid. S'ometrà.`);
            continue;
        }
        
        let edifici = 'Sin edificio';
        if (user.locations && user.locations[0]?.buildingId) {
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
            if (p?.value) {
              phoneSet.add(p.value.trim());
            }
          }
          telefons = [...phoneSet];
        }

        const responsable = user.relations?.[0]?.value || '';
        const planta = user.locations?.[0]?.floorName || '';

        const userData = {
          id: pci,
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
          responsable: responsable,
          planta: planta,
          centreCost: centreCost || '',
          suspès: user.suspended || false,
        };
        
        const userRef = db.collection('directori').doc(pci);
        batch.set(userRef, userData, { merge: true });
      }

      await batch.commit();
      console.log('Importació finalitzada amb èxit!');

      return null;
    } catch (error) {
      console.error("Error durant la importació d'usuaris:", error);
      return null;
    }
  });


exports.getDadesAppSheet = onCall({ region: "europe-west1", memory: "1GiB", timeoutSeconds: 60 }, async (request) => {
  const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
  const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj"; 

  const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;

  const body = JSON.stringify({
    "Action": "Find", 
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
  return data;
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

      // 2. Processar i calcular usuaris presents
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const userPunches: { [key: string]: any[] } = {};

      for (const fitxatge of fitxatges) {
        const dateStr = fitxatge['Fecha y Hora'] || fitxatge['Data'];
        if (!dateStr || typeof dateStr !== 'string') continue;
        
        const employeeId = fitxatge.P_CI;
        if (!employeeId || typeof employeeId !== 'string') continue;

        const parts = dateStr.split(/[\s/:]+/); // MM, DD, YYYY, HH, mm, ss
        if(parts.length < 6) continue;

        const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]));

        if (date >= today) {
          if (!userPunches[employeeId]) {
            userPunches[employeeId] = [];
          }
          userPunches[employeeId].push({ ...fitxatge, parsedDate: date });
        }
      }

      const presentUsersData: { [key: string]: any } = {};
      const presentUserIds = new Set<string>();

      for (const employeeId in userPunches) {
        const punches = userPunches[employeeId];
        if (punches.length % 2 !== 0) { // Odd number of punches means they are in
          punches.sort((a, b) => b.parsedDate - a.parsedDate);
          const lastPunch = punches[0];
          
          presentUserIds.add(employeeId);
          
          presentUsersData[employeeId] = {
            horaDarreraEntrada: Timestamp.fromDate(lastPunch.parsedDate),
          };
        }
      }
      
      // Get details for present users from 'directori'
      const directorySnapshot = await db.collection('directori').where('id', 'in', Array.from(presentUserIds)).get();
      const directoryData: { [key: string]: any } = {};
      directorySnapshot.forEach(doc => {
          directoryData[doc.id] = doc.data();
      });

      // Enrich presentUsersData with details from directory
      for (const employeeId of presentUserIds) {
          const details = directoryData[employeeId];
          if(details) {
              presentUsersData[employeeId].nom = details.nom;
              presentUsersData[employeeId].cognoms = details.cognom;
          }
      }

      // 3. Sincronitzar amb Firestore
      const usuarisDinsFirestoreSnapshot = await db.collection('usuaris_dins').get();
      const usuarisDinsFirestoreIds = new Set(usuarisDinsFirestoreSnapshot.docs.map(doc => doc.id));

      const usuarisPerAfegirOActualitzar = Array.from(presentUserIds);
      const usuarisPerEliminar = [...usuarisDinsFirestoreIds].filter(id => !presentUserIds.has(id));

      const batch = db.batch();

      // Add or update users who are present
      for (const userId of usuarisPerAfegirOActualitzar) {
        const docRef = db.collection('usuaris_dins').doc(userId);
        if (presentUsersData[userId]?.nom) { // Only add if we have the user details
            batch.set(docRef, presentUsersData[userId], { merge: true });
        }
      }

      // Remove users who are no longer present
      for (const userId of usuarisPerEliminar) {
        const docRef = db.collection('usuaris_dins').doc(userId);
        batch.delete(docRef);
      }

      if (usuarisPerAfegirOActualitzar.length > 0 || usuarisPerEliminar.length > 0) {
        await batch.commit();
        console.log(`Sincronització finalitzada. Presents: ${usuarisPerAfegirOActualitzar.length}, Eliminats: ${usuarisPerEliminar.length}`);
      } else {
        console.log("Sincronització finalitzada. No s'han trobat canvis.");
      }

      return null;

    } catch (error) {
      console.error("Error durant la sincronització de personal present:", error);
      return null;
    }
  });

    
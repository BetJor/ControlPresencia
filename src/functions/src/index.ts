import * as functions from 'firebase-functions';
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
      google.options({ auth: authClient });

      const admin = google.admin('directory_v1');
      const db = getFirestore();

      let users: any[] = [];
      let nextPageToken: string | null | undefined = null;

      // 1. Obtenir tots els usuaris de Google Workspace (amb paginació)
      do {
        const response = await admin.users.list({
          customer: 'my_customer',
          maxResults: 500, // Pots demanar fins a 500 per pàgina
          projection: 'full',
          viewType: 'domain_public',
          orderBy: 'email',
          pageToken: nextPageToken,
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
          const phoneValues = user.phones.map((p: any) => p.value.trim());
          telefons = [...new Set(phoneValues)]; // Converteix a Set per eliminar duplicats i torna a array
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

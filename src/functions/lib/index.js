"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const googleapis_1 = require("googleapis");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const node_fetch_1 = __importDefault(require("node-fetch"));
(0, app_1.initializeApp)();
// Funció que s'executa quan la crida Cloud Scheduler
exports.importarUsuarisAGoogleWorkspace = functions
    .region('europe-west1') // Canvia a la teva regió
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .pubsub.schedule('every 24 hours') // Programació: cada 24 hores
    .onRun(async (context) => {
    console.log("Iniciant la importació d'usuaris de Google Workspace a Firestore.");
    try {
        // Autenticació amb l'API de Google
        const auth = new googleapis_1.google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/admin.directory.user.readonly',
            ],
        });
        const authClient = await auth.getClient();
        googleapis_1.google.options({ auth: authClient }); // Cast to any to avoid complex type issues
        const admin = googleapis_1.google.admin('directory_v1');
        const db = (0, firestore_1.getFirestore)();
        let users = [];
        let nextPageToken = null;
        // 1. Obtenir tots els usuaris de Google Workspace (amb paginació)
        do {
            const response = await admin.users.list({
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
            if (!user.primaryEmail)
                continue; // Ignorem usuaris sense email
            // Neteja i transformació de dades
            let edifici = 'Sin edificio';
            if (user.locations &&
                user.locations[0] &&
                user.locations[0].buildingId) {
                edifici = user.locations[0].buildingId.replace(/-/g, ' ');
            }
            let empresa = null, departament = null, carrec = null, descripcioCarrec = null, centreCost = null;
            if (user.organizations && user.organizations.length > 0) {
                const orgData = user.organizations.length === 1
                    ? user.organizations[0]
                    : user.organizations[1] || user.organizations[0];
                empresa = orgData.name;
                departament = orgData.department;
                carrec = orgData.title;
                descripcioCarrec = orgData.description;
                centreCost = orgData.costCenter;
                if (!empresa) {
                    if (departament === null || departament === void 0 ? void 0 : departament.includes('ONP'))
                        empresa = 'ONPLUS';
                    else if (departament === null || departament === void 0 ? void 0 : departament.includes('BDN'))
                        empresa = 'BDNPLUS';
                    else if (departament === 'F.Fihoca')
                        empresa = 'FIHOCA';
                    else if (departament === 'SAPAS')
                        empresa = 'SAPAS';
                    else if (departament === 'D.DATAPRO')
                        empresa = 'DATAPRO';
                    else if (edifici === 'Valencia, 48' || edifici === 'Cerrajeros, 7')
                        empresa = 'DATAPRO';
                }
            }
            let telefons = [];
            if (user.phones && user.phones.length > 0) {
                const phoneSet = new Set();
                for (const p of user.phones) {
                    if (p === null || p === void 0 ? void 0 : p.value) {
                        phoneSet.add(p.value.trim());
                    }
                }
                telefons = [...phoneSet];
            }
            const responsable = user.relations && user.relations[0] ? user.relations[0].value : null;
            const planta = user.locations && user.locations[0]
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
            // Afegim l'operació al batch, utilitzant centreCost com a ID
            if (centreCost && typeof centreCost === 'string' && centreCost.length > 0) {
                const userRef = db.collection('directori').doc(centreCost);
                batch.set(userRef, userData, { merge: true });
            }
            else {
                // Opcionalment, desar igualment l'usuari amb el seu email si no té centre de cost
                const userRef = db.collection('directori').doc(user.primaryEmail);
                batch.set(userRef, userData, { merge: true });
                console.warn(`L'usuari ${user.primaryEmail} no té un centre de cost vàlid, s'utilitzarà el seu email com a ID.`);
            }
        }
        // 3. Executar totes les escriptures a Firestore
        await batch.commit();
        console.log('Importació finalitzada amb èxit!');
        return null;
    }
    catch (error) {
        console.error("Error durant la importació d'usuaris:", error);
        return null;
    }
});
exports.getDadesAppSheet = (0, https_1.onCall)({ region: "europe-west1", memory: "1GiB", timeoutSeconds: 60 }, async (request) => {
    // Aquesta funció crida l'API d'AppSheet per obtenir dades.
    const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
    const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj"; // TODO: Guardar-la a secrets!
    const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;
    const body = JSON.stringify({
        "Action": "Find", // Acció per buscar/llegir files
        "Properties": {},
        "Rows": []
    });
    const response = await (0, node_fetch_1.default)(url, {
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
    console.log("TRACE: Iniciant la sincronització de personal present.");
    const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
    const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj";
    const db = (0, firestore_1.getFirestore)();
    try {
        // 1. Obtenir fitxatges de AppSheet
        console.log("TRACE: Obtenint fitxatges d'AppSheet...");
        const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;
        const body = JSON.stringify({ "Action": "Find", "Properties": {}, "Rows": [] });
        const response = await (0, node_fetch_1.default)(url, {
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
        const fitxatges = await response.json();
        console.log(`TRACE: S'han rebut ${fitxatges.length} fitxatges d'AppSheet.`);
        // 2. Processar i calcular usuaris presents
        console.log("TRACE: Processant fitxatges per determinar usuaris presents...");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const userPunches = {};
        for (const fitxatge of fitxatges) {
            const dateStr = fitxatge['Fecha y Hora'] || fitxatge['Data'];
            if (!dateStr || typeof dateStr !== 'string') {
                console.warn("TRACE: Ometent fitxatge sense data o amb format invàlid:", fitxatge);
                continue;
            }
            const employeeId = fitxatge.P_CI;
            if (!employeeId || typeof employeeId !== 'string') {
                console.warn("TRACE: Ometent fitxatge sense P_CI o amb format invàlid:", fitxatge);
                continue;
            }
            const parts = dateStr.split(/[\s/:]+/); // MM, DD, YYYY, HH, mm, ss
            if (parts.length < 6) {
                console.warn("TRACE: Ometent fitxatge amb data en format inesperat:", fitxatge);
                continue;
            }
            const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]));
            if (date >= today) {
                if (!userPunches[employeeId]) {
                    userPunches[employeeId] = [];
                }
                userPunches[employeeId].push(Object.assign(Object.assign({}, fitxatge), { parsedDate: date }));
            }
        }
        const presentUsers = {};
        for (const employeeId in userPunches) {
            const punches = userPunches[employeeId];
            if (punches.length % 2 !== 0) { // Nombre senar de fitxatges = DINS
                punches.sort((a, b) => b.parsedDate - a.parsedDate);
                const lastPunch = punches[0];
                presentUsers[employeeId] = {
                    horaDarreraEntrada: firestore_1.Timestamp.fromDate(lastPunch.parsedDate),
                };
            }
        }
        const presentUserIds = Object.keys(presentUsers);
        console.log(`TRACE: Usuaris presents calculats: ${presentUserIds.length}. IDs:`, presentUserIds);
        // 3. Sincronitzar amb Firestore
        console.log("TRACE: Iniciant sincronització amb Firestore.");
        if (presentUserIds.length > 0) {
            const usuarisDinsFirestoreSnapshot = await db.collection('usuaris_dins').get();
            const usuarisDinsFirestoreIds = usuarisDinsFirestoreSnapshot.docs.map(doc => doc.id);
            console.log("TRACE: Obtenint dades del directori per als usuaris presents...");
            const directoriUsersMap = new Map();
            // Dividir presentUserIds en trossos de 30
            const chunkSize = 30;
            for (let i = 0; i < presentUserIds.length; i += chunkSize) {
                const chunk = presentUserIds.slice(i, i + chunkSize);
                console.log(`TRACE: Processant tros ${i / chunkSize + 1} del directori amb ${chunk.length} usuaris.`);
                const directoriQuerySnapshot = await db.collection('directori').where(firestore_1.FieldPath.documentId(), 'in', chunk).get();
                directoriQuerySnapshot.forEach(doc => {
                    const data = doc.data();
                    directoriUsersMap.set(doc.id, {
                        nom: data.nom || '',
                        cognom: data.cognom || ''
                    });
                });
            }
            console.log(`TRACE: S'han trobat ${directoriUsersMap.size} usuaris al directori.`);
            const presentUserIdsSet = new Set(presentUserIds);
            const usuarisPerEliminar = usuarisDinsFirestoreIds.filter(id => !presentUserIdsSet.has(id));
            console.log(`TRACE: Usuaris a eliminar de 'usuaris_dins': ${usuarisPerEliminar.length}. IDs:`, usuarisPerEliminar);
            const batch = db.batch();
            console.log("TRACE: Preparant batch per actualitzar 'usuaris_dins'...");
            for (const userId of presentUserIds) {
                const userInfo = directoriUsersMap.get(userId);
                if (!userInfo) {
                    console.warn(`WARN: No s'ha trobat l'usuari amb P_CI (ID) '${userId}' al directori. S'utilitzarà 'N/A'.`);
                }
                const docRef = db.collection('usuaris_dins').doc(userId);
                const dataToSet = Object.assign(Object.assign({}, presentUsers[userId]), { nom: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nom) || 'N/A', cognom: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.cognom) || 'N/A' });
                batch.set(docRef, dataToSet, { merge: true });
            }
            for (const userId of usuarisPerEliminar) {
                const docRef = db.collection('usuaris_dins').doc(userId);
                batch.delete(docRef);
            }
            console.log("TRACE: Executant batch a Firestore...");
            await batch.commit();
            console.log(`Sincronització finalitzada. Presents: ${presentUserIds.length}, Eliminats: ${usuarisPerEliminar.length}`);
        }
        else {
            console.log("TRACE: No hi ha usuaris presents segons AppSheet.");
            const usuarisDinsFirestoreSnapshot = await db.collection('usuaris_dins').get();
            if (!usuarisDinsFirestoreSnapshot.empty) {
                console.log(`TRACE: Buidant la col·lecció 'usuaris_dins' (conté ${usuarisDinsFirestoreSnapshot.size} registres).`);
                const batch = db.batch();
                usuarisDinsFirestoreSnapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Sincronització finalitzada. S'han eliminat ${usuarisDinsFirestoreSnapshot.size} registres de 'usuaris_dins'.`);
            }
            else {
                console.log("Sincronització finalitzada. No hi ha usuaris presents i 'usuaris_dins' ja està buida.");
            }
        }
        return null;
    }
    catch (error) {
        console.error("ERROR FATAL durant la sincronització de personal present:", error.message, error.stack);
        return null;
    }
});
//# sourceMappingURL=index.js.map
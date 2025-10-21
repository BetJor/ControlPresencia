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
exports.importarUsuarisAGoogleWorkspace = functions
    .region('europe-west1')
    .runWith({ timeoutSeconds: 540, memory: '1GB' })
    .pubsub.schedule('every 24 hours')
    .onRun(async (context) => {
    var _a, _b, _c, _d, _e, _f;
    console.log("Iniciant la importació d'usuaris de Google Workspace a Firestore.");
    try {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            scopes: [
                'https://www.googleapis.com/auth/admin.directory.user.readonly',
            ],
        });
        const authClient = await auth.getClient();
        googleapis_1.google.options({ auth: authClient });
        const admin = googleapis_1.google.admin('directory_v1');
        const db = (0, firestore_1.getFirestore)();
        let users = [];
        let nextPageToken = null;
        do {
            const response = await admin.users.list({
                customer: 'my_customer',
                maxResults: 500,
                projection: 'full',
                viewType: 'domain_public',
                orderBy: 'email',
                pageToken: nextPageToken || undefined,
            });
            if (response.data.users) {
                users = users.concat(response.data.users);
            }
            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);
        console.log(`S'han trobat ${users.length} usuaris.`);
        const batch = db.batch();
        const departmentSet = new Set();
        for (const user of users) {
            if (!user.primaryEmail)
                continue;
            let edifici = 'Sin edificio';
            if ((_b = (_a = user.locations) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.buildingId) {
                edifici = user.locations[0].buildingId.replace(/-/g, ' ');
            }
            let empresa = null, departament = null, carrec = null, descripcioCarrec = null, centreCost = null;
            if (user.organizations && user.organizations.length > 0) {
                const orgData = user.organizations.length === 1 ? user.organizations[0] : user.organizations[1] || user.organizations[0];
                empresa = orgData.name;
                departament = orgData.department;
                carrec = orgData.title;
                descripcioCarrec = orgData.description;
                centreCost = orgData.costCenter;
                if (departament) {
                    departmentSet.add(departament);
                }
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
                user.phones.forEach((p) => (p === null || p === void 0 ? void 0 : p.value) && phoneSet.add(p.value.trim()));
                telefons = [...phoneSet];
            }
            const responsable = ((_d = (_c = user.relations) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || null;
            const planta = ((_f = (_e = user.locations) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.floorName) || null;
            const userData = {
                nom: user.name.givenName || '',
                cognom: user.name.familyName || '',
                email: user.primaryEmail,
                edifici,
                empresa: empresa || '',
                departament: departament || '',
                carrec: carrec || '',
                descripcioCarrec: descripcioCarrec || '',
                telefons,
                fotoUrl: user.thumbnailPhotoUrl || '',
                responsable: responsable || '',
                planta: planta || '',
                centreCost: centreCost || '',
                suspès: user.suspended || false,
            };
            if (centreCost && typeof centreCost === 'string' && centreCost.length > 0) {
                const userRef = db.collection('directori').doc(centreCost);
                batch.set(userRef, userData, { merge: true });
            }
            else {
                const userRef = db.collection('directori').doc(user.primaryEmail);
                batch.set(userRef, userData, { merge: true });
                console.warn(`L'usuari ${user.primaryEmail} no té un centre de cost vàlid, s'utilitzarà el seu email com a ID.`);
            }
        }
        // Sincronitzar departaments
        const departmentsCollectionRef = db.collection('departaments');
        const existingDepartmentsSnapshot = await departmentsCollectionRef.get();
        const existingDepartmentIds = new Set(existingDepartmentsSnapshot.docs.map(doc => doc.id));
        departmentSet.forEach(dep => {
            if (!existingDepartmentIds.has(dep)) {
                const depRef = departmentsCollectionRef.doc(dep);
                batch.set(depRef, { name: dep });
            }
            existingDepartmentIds.delete(dep); // Remove from set to find departments to delete
        });
        existingDepartmentIds.forEach(depIdToDelete => {
            const depRef = departmentsCollectionRef.doc(depIdToDelete);
            batch.delete(depRef);
        });
        await batch.commit();
        console.log('Importació i sincronització de departaments finalitzada amb èxit!');
        return null;
    }
    catch (error) {
        console.error("Error durant la importació d'usuaris:", error);
        return null;
    }
});
exports.getDadesAppSheet = (0, https_1.onCall)({ region: "europe-west1", memory: "1GiB", timeoutSeconds: 60 }, async (request) => {
    const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
    const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj";
    const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;
    const body = JSON.stringify({
        "Action": "Find",
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
    return data;
});
exports.sincronitzarPersonalPresent = functions
    .region('europe-west1')
    .pubsub.schedule('every 5 minutes')
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
    console.log("TRACE: Iniciant la sincronització de personal present.");
    const APP_ID = "94c06d4b-4ed0-49d4-85a9-003710c7038b";
    const APP_ACCESS_KEY = "V2-LINid-jygnH-4Eqx6-xEe13-kXpTW-ZALoX-yY7yc-q9EMj";
    const db = (0, firestore_1.getFirestore)();
    try {
        console.log("TRACE: Obtenint fitxatges d'AppSheet...");
        const url = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/dbo.Google_EntradasSalidas/Action`;
        const body = JSON.stringify({ "Action": "Find", "Properties": {}, "Rows": [] });
        const response = await (0, node_fetch_1.default)(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ApplicationAccessKey': APP_ACCESS_KEY },
            body: body
        });
        if (!response.ok) {
            throw new Error(`Error de l'API d'AppSheet: ${response.statusText}`);
        }
        const fitxatges = await response.json();
        console.log(`TRACE: S'han rebut ${fitxatges.length} fitxatges d'AppSheet.`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const userPunches = {};
        for (const fitxatge of fitxatges) {
            const dateStr = fitxatge['Fecha y Hora'] || fitxatge['Data'];
            let employeeId = fitxatge.Identificador;
            if (!dateStr || typeof dateStr !== 'string' || employeeId === null || employeeId === undefined)
                continue;
            employeeId = String(employeeId).trim();
            if (employeeId.length === 0)
                continue;
            const parts = dateStr.split(/[\s/:]+/);
            if (parts.length < 6)
                continue;
            const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]));
            if (date >= today) {
                if (!userPunches[employeeId])
                    userPunches[employeeId] = [];
                userPunches[employeeId].push(Object.assign(Object.assign({}, fitxatge), { parsedDate: date }));
            }
        }
        const presentUsers = {};
        for (const employeeId in userPunches) {
            const punches = userPunches[employeeId];
            if (punches.length % 2 !== 0) {
                punches.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
                const lastPunch = punches[0];
                presentUsers[employeeId] = {
                    horaDarreraEntrada: firestore_1.Timestamp.fromDate(lastPunch.parsedDate),
                    nomOriginal: lastPunch.Nombre || '',
                    cognomsOriginal: lastPunch.Apellidos || '',
                    nombreMoviments: punches.length,
                };
            }
        }
        const presentUserIds = Object.keys(presentUsers);
        console.log(`TRACE: Usuaris presents calculats: ${presentUserIds.length}.`);
        const usuarisDinsCollection = db.collection('usuaris_dins');
        const usuarisDinsFirestoreSnapshot = await usuarisDinsCollection.get();
        const usuarisDinsFirestoreIds = new Set(usuarisDinsFirestoreSnapshot.docs.map(doc => doc.id));
        const batch = db.batch();
        if (presentUserIds.length > 0) {
            const directoriUsersMap = new Map();
            const chunkSize = 30;
            for (let i = 0; i < presentUserIds.length; i += chunkSize) {
                const chunk = presentUserIds.slice(i, i + chunkSize);
                if (chunk.length > 0) {
                    const directoriQuerySnapshot = await db.collection('directori').where('centreCost', 'in', chunk).get();
                    directoriQuerySnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.centreCost) {
                            directoriUsersMap.set(String(data.centreCost).trim(), { nom: data.nom || '', cognom: data.cognom || '' });
                        }
                    });
                }
            }
            for (const userId of presentUserIds) {
                const userInfo = directoriUsersMap.get(userId);
                const dataToSet = {
                    horaDarreraEntrada: presentUsers[userId].horaDarreraEntrada,
                    nom: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nom) || presentUsers[userId].nomOriginal,
                    cognoms: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.cognom) || presentUsers[userId].cognomsOriginal,
                    nombreMoviments: presentUsers[userId].nombreMoviments,
                };
                const docRef = usuarisDinsCollection.doc(userId);
                batch.set(docRef, dataToSet, { merge: true });
                usuarisDinsFirestoreIds.delete(userId);
            }
        }
        usuarisDinsFirestoreIds.forEach(idToDelete => {
            batch.delete(usuarisDinsCollection.doc(idToDelete));
        });
        await batch.commit();
        console.log(`Sincronització finalitzada.`);
        return null;
    }
    catch (error) {
        console.error("ERROR FATAL durant la sincronització de personal present:", error.message, error.stack);
        return null;
    }
});
//# sourceMappingURL=index.js.map
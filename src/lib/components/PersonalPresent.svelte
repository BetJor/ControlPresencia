<script>
    import { onMount } from 'svelte';
    import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
    
    // Hauràs d'assegurar-te que la teva configuració de Firebase s'importa correctament.
    // Això és un exemple, potser has d'ajustar la ruta a '$lib/firebase.js' o similar.
    import { db } from '$lib/firebase'; 

    let personalPresent = [];
    let loading = true;

    onMount(() => {
        const usuarisDinsRef = collection(db, "usuaris_dins");

        const unsubscribe = onSnapshot(usuarisDinsRef, async (snapshot) => {
            loading = true;
            const personalPresentEmails = snapshot.docs.map(doc => doc.id);
            
            // Per cada email, busquem el document complet a la col·lecció 'directori'
            const promises = personalPresentEmails.map(email => {
                const userRef = doc(db, "directori", email);
                return getDoc(userRef);
            });

            const userDocs = await Promise.all(promises);
            
            // Filtrem els que existeixen i mapejem les dades
            personalPresent = userDocs
                .filter(docSnap => docSnap.exists())
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            
            loading = false;
        });

        // Deixem d'escoltar canvis quan el component es destrueix per evitar pèrdues de memòria
        return () => unsubscribe();
    });
</script>

<div class="container-personal-present">
    <h3>Personal a l'oficina</h3>
    {#if loading}
        <p>Actualitzant...</p>
    {:else if personalPresent.length === 0}
        <p>No hi ha ningú a l'oficina en aquests moments.</p>
    {:else}
        <ul>
            {#each personalPresent as user (user.id)}
                <li>
                    <img 
                        src={user.fotoUrl || 'https://www.gravatar.com/avatar/?d=mp'} 
                        alt="Foto de {user.nom}" 
                    />
                    <span>{user.nom} {user.cognom}</span>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .container-personal-present {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1rem;
        background-color: #f9f9f9;
        max-width: 400px;
    }
    h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #eeeeee;
        padding-bottom: 0.5rem;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    li {
        display: flex;
        align-items: center;
        padding: 0.75rem 0.25rem;
        border-bottom: 1px solid #eee;
    }
    li:last-child {
        border-bottom: none;
    }
    img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 12px;
        object-fit: cover;
        background-color: #e0e0e0;
    }
    span {
        font-size: 0.95rem;
        color: #444;
    }
    p {
        text-align: center;
        color: #777;
        padding: 1rem 0;
    }
</style>

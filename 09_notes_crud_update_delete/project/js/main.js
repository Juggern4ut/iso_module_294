const BASE_URL = "http://notes.iso.lmeier.ch";
const NOTES_ENDPOINT = `${BASE_URL}/api/collections/notes/records`;
const USERS_ENDPOINT = `${BASE_URL}/api/collections/users/records`;
const MEIER_ID = "l7tixlaa2874m5c";

let editNoteId = null;
let users = [];
let notes = [];

const form = document.querySelector(".note-form");

/** 
    * Lädt alle Notizen vom Backend
*/
const loadNotes = () => {
    fetch(NOTES_ENDPOINT).then(res => res.json()).then(data => {
        notes = data.items;
        renderNotes(notes);
    });
}

const deleteNote = (id) => {
    fetch(`${NOTES_ENDPOINT}/${id}`, { method: 'DELETE' })
        .then(res => {
            alert("Notiz gelöscht!");
            loadNotes();
        })
        .catch(err => {
            alert("Fehler beim löschen aufgetreten");
        });
}

const editNote = id => {
    editNoteId = id;
    const note = notes.find(n => n.id === id);
    form.querySelector("#title").value = note.title;
    form.querySelector("#content").value = note.content;
}

const loadUsers = () => {
    fetch(USERS_ENDPOINT).then(res => res.json()).then(data => {
        users = data.items;
        loadNotes();
    });
}

const renderNotes = (notes) => {
    const container = document.querySelector(".notes");
    container.innerHTML = "";
    notes.forEach(n => {
        const el = document.createElement("article");
        el.classList.add("note");
        if(n.done){
            el.classList.add("note--done");
        }

        let user = null;
        if (n.user) {
            user = users.find(u => u.id == n.user);
        } else {
            user = { name: 'Unbekannt' };
        }

        el.innerHTML = `
            <span class="user">${user?.name}</span>
            <section>
                <p class="title">${n.title}</p>
                <p class="note-content">${n.content}</p>
            </section>
            <div class="buttons">
                <button data-edit-id="${n.id}" class="button button--edit">Bearbeiten</button>
                <button data-delete-id="${n.id}" class="button button--delete">Löschen</button>
            </div>
        `;

        container.appendChild(el);

        const delButton = el.querySelector(".button--delete");
        delButton.addEventListener("click", () => {
            deleteNote(n.id);
        });

        const editButton = el.querySelector(".button--edit");
        editButton.addEventListener("click", () => {
            editNote(n.id);
        });
    });
}

const createNote = (body) => {
    fetch(NOTES_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => {
        return res.json()
    }).then(() => loadNotes());
}

const patchNote = (body, id) => {
    fetch(`${NOTES_ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => {
        return res.json()
    }).then(() => loadNotes());
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.querySelector("#title").value;
    const content = document.querySelector("#content").value;
    const body = {
        title: title,
        content: content
    }

    if (editNoteId) {
        patchNote(body, editNoteId);
        editNoteId = null;
    } else {
        body.user = MEIER_ID;
        createNote(body);
    }

    document.querySelector("#title").value = "";
    document.querySelector("#content").value = "";
});

loadUsers();

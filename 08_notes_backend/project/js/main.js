const BASE_URL = "http://notes.iso.lmeier.ch";
const NOTES_ENDPOINT = `${BASE_URL}/api/collections/notes/records`;
const USERS_ENDPOINT = `${BASE_URL}/api/collections/users/records`;
const MEIER_ID = "l7tixlaa2874m5c";

let users = [];

const loadNotes = () => {
    fetch(NOTES_ENDPOINT).then(res => res.json()).then(data => {
        renderNotes(data.items);
    });
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

        const title = document.createElement("p");
        title.classList.add("title");
        title.innerHTML = n.title;
       
        const user = document.createElement("p");
        user.classList.add("user");
        if(n.user){
            user.innerHTML = users.find(u => u.id == n.user).name;
        }
        const body = document.createElement("p");
        body.classList.add("note-content");
        body.innerHTML = n.content;

        el.appendChild(title);
        el.appendChild(body);
        el.appendChild(user);
        container.appendChild(el);
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

const form = document.querySelector(".note-form");
form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.querySelector("#title").value; 
    const content = document.querySelector("#content").value;
    const body = {
        title: title,
        content: content,
        user: MEIER_ID
    }
    createNote(body);
});

loadUsers();

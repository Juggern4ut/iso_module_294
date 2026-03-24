const BASE_URL = "http://notes.iso.lmeier.ch";
const NOTES_ENDPOINT = `${BASE_URL}/api/collections/notes/records`;
const USERS_ENDPOINT = `${BASE_URL}/api/collections/users/records`;
const AUTH_ENDPOINT = `${BASE_URL}/api/collections/users/auth-with-password`;
const MEIER_ID = "l7tixlaa2874m5c";

let users = [];
let notes = [];

const sortInput = document.querySelector("#sort");

const loginForm = document.querySelector("#login");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const logout = document.querySelector("#logout");

const title = document.querySelector("#title");
const content = document.querySelector("#content");

const pageContent = document.querySelector("#page-content");

const searchInput = document.querySelector("#search");

const form = document.querySelector(".note-form");

const setToken = token => {
    window.localStorage.setItem("notes-token", token);
}

const getToken = () => {
    return window.localStorage.getItem("notes-token");
}

const clearToken = () => {
    window.localStorage.removeItem("notes-token");
}

const loadNotes = () => {
    fetch(NOTES_ENDPOINT, { headers: { 'Authorization': getToken() } }).then(res => res.json()).then(data => {
        notes = data.items;
        renderNotes(data.items);
    });
}

const login = (username, password) => {
    fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({
            identity: username,
            password: password
        })
    }).then(res => res.json()).then(data => {
        setToken(data.token);
        window.location.reload();
    });

}

const loadUsers = () => {
    fetch(USERS_ENDPOINT).then(res => res.json()).then(data => {
        users = data.items;
        loadNotes();
    });
}

const formatDate = date => {
    let result = "";
    result += String(date.getDate()).padStart(2, '0') + ".";
    result += String((date.getMonth() + 1)).padStart(2, '0') + ".";
    result += date.getFullYear() + " ";
    result += String(date.getHours()).padStart(2, '0') + ":";
    result += String(date.getMinutes()).padStart(2, '0');
    return result;
}

const renderNotes = (notes) => {
    const container = document.querySelector(".notes");
    container.innerHTML = "";
    notes.forEach(n => {
        const el = document.createElement("article");
        el.classList.add("note");
        el.classList.add("card");

        const date = document.createElement("p");
        date.classList.add("date");
        date.textContent = formatDate(new Date(n.created));

        const title = document.createElement("p");
        title.classList.add("title");
        title.textContent = n.title;

        const user = document.createElement("p");
        user.classList.add("user");
        if (n.user) {
            user.innerHTML = users.find(u => u.id == n.user).name;
        }
        const body = document.createElement("p");
        body.classList.add("note-content");
        body.textContent = n.content;

        el.appendChild(date);
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
            'Content-Type': "application/json",
            'Authorization': getToken()
        },
        body: JSON.stringify(body)
    }).then(res => {
        title.value = "";
        content.value = "";
        return res.json();
    }).then(() => loadNotes());
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const body = {
        title: title.value,
        content: content.value,
        user: MEIER_ID
    }
    createNote(body);
});


searchInput.addEventListener("input", () => {
    let filteredNotes = [...notes].filter(n => {

        const searchTerm = searchInput.value.toLowerCase();
        const haystack = n.content.toLowerCase() + " " + n.title.toLowerCase();

        return haystack.indexOf(searchTerm) >= 0;
    });
    renderNotes(filteredNotes);
});


sortInput.addEventListener("change", () => {
    let sortedNotes = [...notes].sort((a, b) => {
        if (sortInput.value === "date-desc") {
            return new Date(b.created) - new Date(a.created);
        } else if (sortInput.value === "date-asc") {
            return new Date(a.created) - new Date(b.created);
        } else {
            return a.title.localeCompare(b.title);
        }
    });
    renderNotes(sortedNotes);
});

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    login(username.value, password.value);
});

logout.addEventListener("click", e => {
    clearToken();
    window.location.reload();
});

window.addEventListener("load", e => {
    if (getToken()) {
        loginForm.classList.add("hidden");
        pageContent.classList.remove("hidden");
    }
});

loadUsers();



//Logik för inlogg, utlogg och registrering av användare

let loginBtn = document.getElementById("login-btn");
let nameField = document.getElementById("nameField");
let title = document.getElementById("title");
let loginRegisterPage = document.getElementById("login-register-page");
let registerBtn = document.getElementById("register-btn");
let logOutBtn = document.getElementById("logOut-btn");
let adminPage = document.getElementById("admin-page");
let userNameElement = document.getElementById('user-name');
let bookPage = document.getElementById("book-page");
let bookList = document.getElementById("book-list");
let myBookList = document.getElementById("my-book-list");
let userHeader = document.getElementById("user-header");

// Hämta inputfälten för registrering
nameInput = document.getElementById("name-input");
emailInput = document.getElementById("email-input");
passwordInput = document.getElementById("password-input");



// Funktion för att rensa värdena från inputfälten
const clearInputs = () => {
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
};

const clearMyBookList = () => {
    myBookList.innerHTML = "";
};


const showLoginForm = () => {

    loginRegisterPage.classList.add("login-mode");
    title.textContent = "Log In"
    clearInputs();

};

const showRegisterForm = () => {

    loginRegisterPage.classList.remove("login-mode");
    title.textContent = "Sign Up"
    clearInputs();

};

const registerAccount = async (event) => {
    try {
        event.preventDefault();

        // Verifiera att inputfälten inte är tomma
        if (!nameInput.value || !emailInput.value || !passwordInput.value) {
            return;
        }

        // Logga de värden som skickas till servern för debugging
        console.log("Registering with:", {
            username: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        });

        const response = await axios.post("http://localhost:1337/api/auth/local/register", {
            username: nameInput.value,
            password: passwordInput.value,
            email: emailInput.value
        });

        if (response.data.jwt) {
            sessionStorage.setItem("token", response.data.jwt);
            sessionStorage.setItem("username", response.data.user.username);
            checkLoginStatus();

            // Visa bookPage och dölj loginRegisterPage
            loginRegisterPage.style.display = "none";
            myBookContainer.style.display = "none";
            bookPage.style.display = "block";

            // Hämta och rendera alla böcker
            await fetchBooks();



        }

    } catch (error) {
        // Logga fullständigt felmeddelande för bättre felsökning
        console.error('Error registering user:', error.response ? error.response.data : error.message);
    }
};



const handleRegisterClick = (event) => {
    if (loginRegisterPage.classList.contains("login-mode")) {
        showRegisterForm();
    } else {
        registerAccount(event);
    }
};

registerBtn.addEventListener("click", handleRegisterClick);

// Rensa inputfälten när sidan laddas
window.addEventListener("load", clearInputs);


const login = async (event) => {
    let loginUsername = document.getElementById("name-input").value;
    let loginPassword = document.getElementById("password-input").value;

    event.preventDefault();
    try {
        console.log("Attempting login with:", {
            identifier: loginUsername,
            password: loginPassword,
        });

        let response = await axios.post("http://localhost:1337/api/auth/local", {
            identifier: loginUsername,
            password: loginPassword,
        });



        if (response.data.jwt) {
            sessionStorage.setItem("token", response.data.jwt);
            sessionStorage.setItem("user", JSON.stringify(response.data.user));

            // Hämta uppdaterade användaruppgifter och uppdatera sessionen
            const token = sessionStorage.getItem("token");
            const userData = await getUserData(token);
            sessionStorage.setItem("username", userData.username);
            checkLoginStatus();
            clearMyBookList();

            // Visa bookPage och dölj loginRegisterPage
            loginRegisterPage.style.display = "none";
            bookPage.style.display = "block";

            // Hämta och rendera alla böcker
            await fetchBooks();


        }

    } catch (error) {
        console.error('Error logging in:', error.response ? error.response.data : error.message);
    }
};

const handleLoginClick = (event) => {
    if (!loginRegisterPage.classList.contains("login-mode")) {
        showLoginForm();

    } else {
        login(event);
    }
};

loginBtn.addEventListener("click", handleLoginClick);


const checkLoginStatus = async () => {

    const token = sessionStorage.getItem("token");

    if (token) {
        try {
            const userData = await getUserData(token);



            // Uppdatera användarnamnet i headern
            sessionStorage.setItem("username", userData.username);
            userNameElement.textContent = userData.username;


            userHeader.style.display = "block";
            loginRegisterPage.style.display = "none";
            bookPage.style.display = "block";
            myBookContainer.style.display = "none";
            // Hämta och rendera alla böcker
            renderFavoriteBooks();
            await fetchBooks();


        } catch (error) {
            logOut();
        }
    } else {

        loginRegisterPage.style.display = "block";
        bookPage.style.display = "none";
        userHeader.style.display = "none";

    }
};




// Funktion för att hantera utloggning
const logOut = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    clearInputs();
    checkLoginStatus();
    clearMyBookList();
    location.reload();
};

// Lägg till händelselyssnare för utloggningsknappen
logOutBtn.addEventListener("click", logOut);

// Kontrollera inloggningsstatus vid laddning av sidan
document.addEventListener("DOMContentLoaded", checkLoginStatus);

//---------------------------------------------//

// Hämta och rendera samtliga böcker från API:et

const getUserData = async (token) => {
    try {
        const response = await axios.get("http://localhost:1337/api/users/me?populate=books.img", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const fetchBooks = async () => {
    try {
        // Kontrollera om användaren är inloggad
        const token = sessionStorage.getItem("token");
        if (!token) {
            return;
        }

        // Användaren är inloggad, fortsätt med att hämta böcker
        console.log("Fetching books...");
        let response = await axios.get("http://localhost:1337/api/books?populate=*", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });


        bookList.innerHTML = ''; // Rensa listan innan rendering
        response.data.data.forEach(book => {
            bookList.innerHTML += `
            <li data-id="${book.id}">
                <div class="book">
                    <div class="book-image">
                        <img src="http://localhost:1337${book.attributes.img.data.attributes.url}" alt="${book.attributes.title}" />
                    </div>
                    <div class="book-info">
                        <p class="book-title">${book.attributes.title}</p>
                        <p class="book-author">${book.attributes.author}</p>
                        <p>Utgivningsdatum: ${book.attributes.releaseDate}</p>
                        <p>Antal sidor: ${book.attributes.pages}</p>
                    </div>
                    <div class="favorite-book">
                        <i class="fas fa-heart" data-id="${book.id}"></i>
                    </div>
                </div>
            </li>
            `;
        });

        // Lägg till click event listener på hjärtikonerna
        document.querySelectorAll('.fas.fa-heart').forEach(heartIcon => {
            heartIcon.addEventListener('click', async (event) => {
                const bookId = event.target.getAttribute('data-id');
                await addBookToFavorites(bookId);
            });
        });


    } catch (error) {
        console.error('Error fetching books:', error.response ? error.response.data : error.message);
    }
};

const addBookToFavorites = async (bookId) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            return;
        }

        // Hämta nuvarande användarobjektet
        const userData = await getUserData(token);
        console.log("Fetched userData:", userData);

        // Kontrollera om boken redan finns i favoritlistan
        if (userData.books.some(book => String(book.id) === String(bookId))) {
            alert("Book already in favorites.");
            return; // Avbryt funktionen om boken redan är sparad
        }

        // Lägg till den nya boken till användarens favoritlista
        userData.books.push({ id: bookId });

        // Skicka en PUT-förfrågan till servern för att uppdatera användarobjektet med den nya boken i favoritlistan
        const response = await axios.put(`http://localhost:1337/api/users/${userData.id}`, {
            books: userData.books.map(book => ({ id: book.id }))
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        alert("Book added to your favorites!");

        // Uppdatera renderingen av favoritböcker
        await renderFavoriteBooks();
    } catch (error) {
        console.error('Error adding book to favorites:', error.response ? error.response.data : error.message);
    }
};


// Hämta elementet för dropdown-menyn
const sortSelect = document.getElementById("sort-select");

// Lägg till en händelselyssnare för när användaren väljer ett alternativ
sortSelect.addEventListener("change", async () => {
    // Hämta det valda alternativet från dropdown-menyn
    const sortBy = sortSelect.value;

    // Rendera favoritböcker baserat på det valda sorteringsalternativet
    await renderFavoriteBooks(sortBy);
});

const renderFavoriteBooks = async (sortBy) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            return;
        }

        // Hämta användarens data
        const userData = await getUserData(token);
        const userBooks = userData.books;

        // Sortera favoritböcker baserat på det valda sorteringsalternativet
        if (sortBy === "title") {
            userBooks.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "author") {
            userBooks.sort((a, b) => a.author.localeCompare(b.author));
        }

        // Rensa listan innan rendering
        myBookList.innerHTML = '';

        userBooks.forEach(book => {
            const bookImageUrl = book.img ? `http://localhost:1337${book.img.url}` : 'default-image-url';

            myBookList.innerHTML += `
                <li data-id="${book.id}">
                    <div class="book">
                        <div class="book-image">
                            <img src="${bookImageUrl}" alt="${book.title}" />
                        </div>
                        <div class="book-info">
                            <p class="book-title">${book.title}</p>
                            <p class="book-author">${book.author}</p>
                            <p>Utgivningsdatum: ${book.releaseDate}</p>
                            <p>Antal sidor: ${book.pages}</p>
                        </div>
                        <div class="book-actions">
                            <button class="delete-book">
                                <i class="fas fa-trash-alt delete-book-icon"></i>
                            </button>
                        </div>
                    </div>
                </li>
            `;
        });

        // Lägg till event-listener för att hantera borttagning av böcker
        document.querySelectorAll('.delete-book').forEach(button => {
            button.addEventListener('click', async (event) => {
                const bookId = event.currentTarget.closest('li').getAttribute('data-id');
                await removeBookFromFavorites(bookId);
            });
        });

    } catch (error) {
        console.error('Error rendering favorite books:', error.response ? error.response.data : error.message);
    }
};

const removeBookFromFavorites = async (bookId) => {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            return;
        }

        // Hämta nuvarande användarobjektet
        const userData = await getUserData(token);

        // Filtrera bort boken från favoritlistan
        userData.books = userData.books.filter(book => String(book.id) !== String(bookId));

        // Skicka en PUT-förfrågan till servern för att uppdatera användarobjektet utan den borttagna boken
        const response = await axios.put(`http://localhost:1337/api/users/${userData.id}`, {
            books: userData.books.map(book => ({ id: book.id }))
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        alert("Book removed from favorites!");

        // Ta bort bokelementet från DOM:en
        const bookElement = document.querySelector(`li[data-id="${bookId}"]`);
        if (bookElement) {
            bookElement.remove();
        }

    } catch (error) {
        console.error('Error removing book from favorites:', error.response ? error.response.data : error.message);
    }
};

let savedBooksBtn = document.getElementById("saved-books-btn");
let myBookContainer = document.getElementById("my-book-container");
let allBooksBtn = document.getElementById("books-btn");

// Visa favoritböcker när knappen trycks
savedBooksBtn.addEventListener('click', () => {
    myBookContainer.style.display = 'block';
    bookList.style.display = 'none';
    renderFavoriteBooks();
});

allBooksBtn.addEventListener('click', () => {
    myBookContainer.style.display = 'none';
    bookList.style.display = 'block';
});



document.addEventListener("DOMContentLoaded", async () => {
    // Kontrollera inloggningsstatus innan du hämtar böcker och favoritböcker
    await checkLoginStatus();
    await fetchBooks();
    await renderFavoriteBooks();
});

const getTheme = async () => {
    const response = await axios.get("http://localhost:1337/api/theme");
    const mode = response.data.data.attributes.mode;
    console.log(mode);

    if (mode === "dark_mode") {
        document.body.classList.toggle("darkmode");
    } else if (mode === "light_mode") {
        document.body.classList.toggle("lightmode");
    } else if (mode === "blue") {
        document.body.classList.toggle("blue");
    }
}

getTheme(); 
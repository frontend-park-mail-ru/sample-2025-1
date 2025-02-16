const root = document.getElementById('root');
const menuContainer = document.createElement('aside');
const pageContainer = document.createElement('main');
root.appendChild(menuContainer);
root.appendChild(pageContainer);

const config = {
    menu: {
        feed: {
            href: '/feed',
            text: 'Лента',
            render: renderFeed
        },
        login: {
            href: '/login',
            text: 'Авторизация',
            render: renderLogin
        },
        signup: {
            href: '/signup',
            text: 'Регистрация',
            render: renderSignup
        },
        profile: {
            href: '/profile',
            text: 'Профиль',
            render: renderProfile
        }
    }
};

const appState = {
    activePageLink: null,
    menuElements: {}
};

function ajax(method, url, body = null, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        callback(xhr.status, xhr.responseText);
    });

    if (body) {
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf8');
        xhr.send(JSON.stringify(body));
        return;
    }

    xhr.send();
}

function goToPage(menuElement) {
    pageContainer.innerHTML = '';

    appState.activePageLink.classList.remove('active');
    menuElement.classList.add('active');
    appState.activePageLink = menuElement;

    const element = config.menu[menuElement.dataset.section].render();

    pageContainer.appendChild(element);
}

function createInput(type, text, name) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = text;

    return input;
}

function renderLogin() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Войти!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        ajax('POST', '/login', { email, password }, (status) => {
            status === 200
                ? goToPage(appState.menuElements.profile)
                : alert('НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ');
        });
    });

    return form;
}

function renderSignup() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');
    const ageInput = createInput('number', 'Возраст', 'age');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Зарегистрироваться!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(ageInput);
    form.appendChild(submitBtn);
    return form;
}

function renderFeed() {
    const feed = document.createElement('div');

    ajax('GET', '/feed', null, (status, response) => {
        const isAuthorized = status === 200;
        if (!isAuthorized) {
            goToPage(appState.menuElements.login);
            return;
        }

        const images = JSON.parse(response);

        if (images && Array.isArray(images)) {
            const div = document.createElement('div');
            feed.appendChild(div);

            images.forEach(({ src, likes, id }) => {
                div.innerHTML += `<img src="${src}" alt="image" width="500">`;
                const likeContainer = document.createElement('div');
                div.appendChild(likeContainer);

                likeContainer.innerHTML = `<span>${likes} лайков</span>`;

                const likeBtn = document.createElement('button');
                likeBtn.textContent = 'Лайк!';
                likeBtn.type = 'button';
                likeBtn.dataset.imageId = id;

                likeContainer.appendChild(likeBtn);
            });
        }
    });

    feed.addEventListener('click', (event) => {
        if (event.target.tagName.toLocaleLowerCase() === 'button' && event.target.dataset.imageId) {
            const { imageId: id } = event.target.dataset;

            ajax('POST', '/like', { id }, (status) => {
                if (status === 200) {
                    const likeContainer = event.target.parentNode;
                    const likeCount = likeContainer.querySelector('span');
                    likeCount.textContent = `${parseInt(likeCount.textContent) + 1} лайков`;
                }
            });
        }
    });

    return feed;
}

function renderMenu() {
    Object.entries(config.menu).forEach(([key, { href, text }], index) => {
        const menuElement = document.createElement('a');
        menuElement.href = href;
        menuElement.innerText = text;
        menuElement.dataset.section = key;

        if (index === 0) {
            menuElement.classList.add('active');
            appState.activePageLink = menuElement;
        }

        appState.menuElements[key] = menuElement;
        menuContainer.appendChild(menuElement);
    });

    menuContainer.addEventListener('click', (event) => {
        if (
            event.target.tagName.toLocaleLowerCase() === 'a' ||
            event.target instanceof HTMLAnchorElement
        ) {
            event.preventDefault();

            goToPage(event.target);
        }
    });
}

function renderProfile() {
    const profile = document.createElement('div');

    ajax('GET', '/me', null, (status, responseString) => {
        const isAuthorized = status === 200;

        if (!isAuthorized) {
            alert('АХТУНГ! НЕТ АВТОРИЗАЦИИ');
            goToPage(appState.menuElements.login);
        }

        const { age, email, images } = JSON.parse(responseString);

        const span = document.createElement('span');
        span.innerText = `Возраст: ${age}, email: ${email}`;
        profile.appendChild(span);

        if (images && Array.isArray(images)) {
            const div = document.createElement('div');
            profile.appendChild(div);

            images.forEach(({ src, likes }) => {
                div.innerHTML += `<img src="${src}" width="500"/><div>${likes} Лайков</div>`;
            });
        }
    });

    return profile;
}

renderMenu();
goToPage(appState.menuElements.feed);

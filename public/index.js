var title = document.getElementById("title");

title.addEventListener('click', (event) => {
    console.log(event);
    event.target.style = 'font-family: "Comic Sans MS"';
})

document.getElementsByTagName("button")[0].addEventListener('click', (event) => {
    const h2 = document.getElementById("title2");
    h2.style = 'display: flex';
})

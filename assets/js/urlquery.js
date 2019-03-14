(() => {

    let search = new URLSearchParams(window.location.search);

    let button = document.getElementById("reload");
    let output = document.getElementById("output");

    function createRandomToken(length) {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        length = length || 32;
        let token = new Array(length).fill("").map(() => {
            let i = Math.floor(Math.random() * chars.length);
            return chars[i];
        }).join("");
        return token;
    }

    button.addEventListener("click", () => {
        let url = `${window.location.href.split("?")[0]}?token=${createRandomToken()}`;
        window.location.replace(url);
    });

    let html = "";
    search.forEach((value, key) => {
        html += `<li><strong>${key}:</strong> ${value}</li>`;
    });
    output.innerHTML = html;

})();

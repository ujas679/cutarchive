// gallery.js
async function loadGallery() {
    try {
        const res = await fetch("./gallery/photos.json", { cache: "no-cache" });
        const photos = await res.json();

        const gallery = document.getElementById("gallery");
        gallery.innerHTML = "";

        photos.forEach((photo) => {
            const item = document.createElement("div");
            item.className = "photo-card";

            item.innerHTML = `
        <img src="${photo.thumb}" alt="${photo.title}">
        <h3>${photo.title}</h3>
        <p>${photo.description}</p>
      `;

            gallery.appendChild(item);
        });
    } catch (err) {
        console.error("Gallery load failed:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadGallery);

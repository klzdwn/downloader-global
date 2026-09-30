const WORKER_URL = "https://dwnder-kalz.alfandiibnunugroho7.workers.dev/";

const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const btnSubmit = document.getElementById("btnSubmit");
const loadingState = document.getElementById("loadingState");
const resultCard = document.getElementById("resultCard");

const mediaPreview = document.getElementById("mediaPreview");
const mediaTitle = document.getElementById("mediaTitle");
const downloadLinkMain = document.getElementById("downloadLinkMain");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
        });

        const json = await response.json();

        // Mengambil data media dari berbagai variasi respon Worker/API
        let mediaData = json.data || json;
        let downloadUrl = "";

        if (typeof mediaData === "string") {
            downloadUrl = mediaData;
        } else if (Array.isArray(mediaData) && mediaData.length > 0) {
            downloadUrl = mediaData[0].url || mediaData[0];
        } else if (mediaData && mediaData.url) {
            downloadUrl = mediaData.url;
        }

        if (downloadUrl && typeof downloadUrl === "string") {
            downloadLinkMain.href = downloadUrl;
            mediaPreview.src = (mediaData && mediaData.thumbnail) || (mediaData && mediaData.cover) || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
            mediaTitle.innerText = (mediaData && mediaData.title) || `Media (${new URL(targetUrl).hostname})`;
            resultCard.classList.remove("hidden");
        } else {
            alert("Gagal memproses tautan. Pastikan link publik dan valid.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi ke server Cloudflare.");
    } finally {
        showLoading(false);
    }
});

function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
    }
}

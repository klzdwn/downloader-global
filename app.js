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

        const data = await response.json();

        if (data && data.data) {
            let downloadUrl = Array.isArray(data.data) ? data.data[0].url : (data.data.url || data.data);
            
            if (downloadUrl) {
                downloadLinkMain.href = downloadUrl;
                mediaPreview.src = data.thumbnail || data.cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
                mediaTitle.innerText = data.title || `Media dari (${new URL(targetUrl).hostname})`;
                resultCard.classList.remove("hidden");
            } else {
                alert("Gagal mengekstrak media dari link tersebut.");
            }
        } else {
            alert("Gagal memproses tautan. Pastikan akun tidak diprivat/tautan valid.");
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

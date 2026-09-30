// Ganti dengan URL domain Vercel kamu nanti setelah di-deploy:
const VERCEL_API_URL = "https://downloader-global.vercel.app/";

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
        const response = await fetch(VERCEL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: targetUrl })
        });

        const data = await response.json();

        if (data && (data.url || data.picker || data.status === "redirect")) {
            let finalUrl = data.url || (data.picker ? data.picker[0].url : null);
            downloadLinkMain.href = finalUrl;
            mediaPreview.src = data.thumb || (data.picker && data.picker[0].thumb ? data.picker[0].thumb : "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80");
            mediaTitle.innerText = `Media berhasil diproses (${new URL(targetUrl).hostname})`;
            resultCard.classList.remove("hidden");
        } else {
            alert(data.text || "Gagal mengambil media. Pastikan tautan publik.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal terhubung ke Vercel Serverless Function.");
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

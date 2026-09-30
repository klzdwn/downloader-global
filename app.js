/**
 * Global Media Downloader Engine
 * Direct Public Proxy Version (Tanpa Perlu Cloudflare Worker)
 */

// Gunakan public proxy percuma untuk bypass CORS & Cloudflare block
const API_URL = "https://corsproxy.io/?" + encodeURIComponent("https://api.cobalt.tools/api/json");

// DOM Elements
const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const btnSubmit = document.getElementById("btnSubmit");
const btnPaste = document.getElementById("btnPaste");
const loadingState = document.getElementById("loadingState");
const resultCard = document.getElementById("resultCard");

const mediaPreview = document.getElementById("mediaPreview");
const mediaTitle = document.getElementById("mediaTitle");
const downloadLinkMain = document.getElementById("downloadLinkMain");

// Paste Clipboard
if (btnPaste) {
    btnPaste.addEventListener("click", async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
        } catch (err) {
            alert("Gagal membaca clipboard.");
        }
    });
}

// Form Submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: targetUrl,
                videoQuality: "max"
            })
        });

        const data = await response.json();

        if (data && (data.url || data.picker || data.status === "redirect")) {
            renderResult(data, targetUrl);
        } else {
            alert(data.text || "Gagal memproses media. Pastikan pautan adalah awam (public).");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("Terjadi kesalahan rangkaian saat menghubungi server.");
    } finally {
        showLoading(false);
    }
});

// Render Output
function renderResult(data, originalUrl) {
    let finalUrl = data.url;

    if (data.picker && data.picker.length > 0) {
        finalUrl = data.picker[0].url;
        if (data.picker[0].thumb) mediaPreview.src = data.picker[0].thumb;
    } else if (data.thumb) {
        mediaPreview.src = data.thumb;
    } else {
        mediaPreview.src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
    }

    downloadLinkMain.href = finalUrl;
    mediaTitle.innerText = `Media berjaya diproses dari (${new URL(originalUrl).hostname})`;
    resultCard.classList.remove("hidden");
}

// Loading Toggle
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
    }
}

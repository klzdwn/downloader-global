/**
 * Global Media Downloader Engine
 * Powered by Cobalt API (Open-Source Multi-Platform Media Engine)
 */

// Konfigurasi Endpoint API (Tempat Khusus API)
const API_CONFIG = {
    // URL Server Cobalt API Publik (Dapat diganti dengan VPS / Self-Hosted milik sendiri)
    ENDPOINT: "https://api.cobalt.tools/api/json",
    
    // Header standar untuk request JSON
    HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
};

// Inisialisasi Elemen DOM
const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const btnSubmit = document.getElementById("btnSubmit");
const btnPaste = document.getElementById("btnPaste");
const loadingState = document.getElementById("loadingState");
const resultCard = document.getElementById("resultCard");

const mediaPreview = document.getElementById("mediaPreview");
const mediaTitle = document.getElementById("mediaTitle");
const downloadLinkMain = document.getElementById("downloadLinkMain");
const downloadLinkAudio = document.getElementById("downloadLinkAudio");

// Event Listener 1: Tombol Paste
btnPaste.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
    } catch (err) {
        alert("Gagal membaca clipboard. Silakan paste manual.");
    }
});

// Event Listener 2: Form Submit & Process API Request
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    // Tampilkan Loading & Sembunyikan Hasil Sebelumnya
    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        // Pemanggilan API utama menggunakan fungsi terpisah
        const data = await fetchMediaFromCobalt(targetUrl);

        if (data && (data.url || data.picker || data.status === "redirect")) {
            renderResult(data, targetUrl);
        } else {
            alert("Gagal memproses media. Pastikan tautan publik & valid.");
        }
    } catch (error) {
        console.error("API Error:", error);
        alert("Terjadi kesalahan koneksi saat menghubungi server API.");
    } finally {
        showLoading(false);
    }
});

/**
 * Fungsi Terpisah Khusus Request ke Cobalt API
 * @param {string} url - Link media dari sosmed
 */
async function fetchMediaFromCobalt(url) {
    const response = await fetch(API_CONFIG.ENDPOINT, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
            url: url,
            videoQuality: "max", // Mengambil kualitas video tertinggi
            filenamePattern: "basic"
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    return await response.json();
}

/**
 * Fungsi untuk Menampilkan Hasil Media ke Tampilan (UI)
 */
function renderResult(data, originalUrl) {
    // 1. Set URL Download Utama
    let finalDownloadUrl = data.url;

    // Jika response berupa gallery/slide (picker mode)
    if (data.status === "picker" && data.picker.length > 0) {
        finalDownloadUrl = data.picker[0].url;
        if (data.picker[0].thumb) {
            mediaPreview.src = data.picker[0].thumb;
        }
    } else {
        // Thumbnail default placeholder jika API tidak memberikan gambar
        mediaPreview.src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
    }

    // 2. Set Link & Judul
    downloadLinkMain.href = finalDownloadUrl;
    mediaTitle.innerText = `Media ditemukan dari: ${new URL(originalUrl).hostname}`;

    // 3. Tampilkan Card Hasil
    resultCard.classList.remove("hidden");
}

/**
 * Utility: Toggle Status Loading
 */
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = "0.7";
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = "1";
    }
}

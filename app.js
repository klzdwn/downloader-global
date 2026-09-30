/**
 * Global Media Downloader Engine
 * Updated dengan CORS Proxy & Fallback API
 */

// Konfigurasi Endpoint API
const API_CONFIG = {
    // Menggunakan CORS Proxy agar request dari GitHub Pages tidak diblokir browser
    PROXY: "https://corsproxy.io/?",
    COBALT_ENDPOINT: "https://api.cobalt.tools/api/json",
    
    // Backup API (Jika Cobalt Public sedang offline/rate-limited)
    TIKWM_ENDPOINT: "https://www.tikwm.com/api/"
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

// Event Listener: Paste
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

// Event Listener: Submit Form
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        let data = null;

        // Coba request via Cobalt dengan CORS Proxy
        try {
            data = await fetchFromCobalt(targetUrl);
        } catch (err) {
            console.warn("Cobalt API gagal/CORS error, mencoba fallback API...", err);
        }

        // Jika Cobalt gagal dan tautan adalah TikTok, coba fallback TikWM API
        if ((!data || !data.url) && targetUrl.includes("tiktok.com")) {
            data = await fetchFromTikWM(targetUrl);
        }

        if (data && (data.url || data.picker)) {
            renderResult(data, targetUrl);
        } else {
            alert("Gagal mengambil media. Pastikan tautan publik & valid, atau coba beberapa saat lagi.");
        }
    } catch (error) {
        console.error("API Error:", error);
        alert("Terjadi kesalahan jaringan. Periksa koneksi internet atau coba link lain.");
    } finally {
        showLoading(false);
    }
});

/**
 * Fetch via Cobalt Engine (With CORS Proxy)
 */
async function fetchFromCobalt(url) {
    // Lewatkan request melalui CORS Proxy
    const targetApi = API_CONFIG.PROXY + encodeURIComponent(API_CONFIG.COBALT_ENDPOINT);

    const response = await fetch(targetApi, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            url: url,
            videoQuality: "max"
        })
    });

    if (!response.ok) throw new Error("Cobalt API failed");
    return await response.json();
}

/**
 * Fallback API khusus TikTok (TikWM) jika Cobalt error
 */
async function fetchFromTikWM(url) {
    const response = await fetch(`${API_CONFIG.TIKWM_ENDPOINT}?url=${encodeURIComponent(url)}`);
    const json = await response.json();
    
    if (json.code === 0 && json.data) {
        return {
            url: json.data.play, // Video tanpa watermark
            picker: json.data.images ? json.data.images.map(img => ({ url: img })) : null,
            thumb: json.data.cover
        };
    }
    return null;
}

/**
 * Render Hasil ke UI
 */
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
    mediaTitle.innerText = `Media berhasil diproses (${new URL(originalUrl).hostname})`;
    resultCard.classList.remove("hidden");
}

/**
 * Helper Loading State
 */
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
    }
}

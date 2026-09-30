/**
 * Global Multi-Platform Media Downloader Engine
 * Direct Universal API (Bypass Cloudflare & CORS)
 */

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

// Form Submit Handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        let result = null;

        // Routing Engine berdasarkan platform
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            result = await fetchTikTok(targetUrl);
        } else if (targetUrl.includes("instagram.com")) {
            result = await fetchInstagram(targetUrl);
        } else {
            // Universal Engine untuk YouTube, Twitter/X, Facebook, Pinterest, dll.
            result = await fetchUniversalGlobal(targetUrl);
        }

        if (result && result.url) {
            renderResult(result, targetUrl);
        } else {
            alert("Gagal memproses media. Pastikan akun tidak diprivat/tautan valid.");
        }
    } catch (error) {
        console.error("Downloader Error:", error);
        alert("Terjadi kesalahan koneksi saat memproses link.");
    } finally {
        showLoading(false);
    }
});

// 1. TikTok Engine (TikWM Direct Public Endpoint)
async function fetchTikTok(url) {
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    if (json.code === 0 && json.data) {
        return {
            url: json.data.play,
            thumb: json.data.cover,
            title: json.data.title || "TikTok Video"
        };
    }
    return null;
}

// 2. Instagram Engine (SnapInsta Proxy - Tembus Cloudflare IG)
async function fetchInstagram(url) {
    try {
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(`https://api.vkrdown.com/insta/?url=${url}`);
        const res = await fetch(proxyUrl);
        const json = await res.json();
        if (json.status && json.data && json.data.length > 0) {
            return {
                url: json.data[0].url,
                thumb: json.data[0].thumbnail || json.data[0].url,
                title: "Instagram Media"
            };
        }
    } catch (e) {
        console.warn("IG Engine 1 fail, trying Universal...", e);
    }
    return await fetchUniversalGlobal(url);
}

// 3. Global Universal Engine (Support YT, Twitter, FB, IG, Pinterest)
async function fetchUniversalGlobal(url) {
    try {
        // Menggunakan CoCoCut Direct Scraper Gateway
        const targetApi = `https://api.vkrdown.com/fetch/?url=${encodeURIComponent(url)}`;
        const res = await fetch("https://corsproxy.io/?" + encodeURIComponent(targetApi));
        const json = await res.json();

        if (json && json.data) {
            let downloadUrl = "";
            if (Array.isArray(json.data) && json.data.length > 0) {
                downloadUrl = json.data[0].url;
            } else if (typeof json.data === 'object' && json.data.url) {
                downloadUrl = json.data.url;
            } else if (typeof json.data === 'string') {
                downloadUrl = json.data;
            }

            if (downloadUrl) {
                return {
                    url: downloadUrl,
                    thumb: json.thumbnail || json.cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
                    title: json.title || "Media Download"
                };
            }
        }
    } catch (e) {
        console.error("Universal Engine fail:", e);
    }
    return null;
}

// Render Result Ke UI
function renderResult(data, originalUrl) {
    mediaPreview.src = data.thumb;
    downloadLinkMain.href = data.url;
    mediaTitle.innerText = data.title || `Media dari (${new URL(originalUrl).hostname})`;
    resultCard.classList.remove("hidden");
}

// Loading Handler
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
    }
}

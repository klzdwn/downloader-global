/**
 * Global Multi-Platform Media Downloader Engine
 * Auto Routing API untuk TikTok, Instagram, YouTube, Twitter/X, FB, dll.
 */

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

// Form Submit Handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();

    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");

    try {
        let resultData = null;

        // Auto-Routing Berdasarkan Platform URL
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            resultData = await fetchTikTok(targetUrl);
        } else if (targetUrl.includes("instagram.com")) {
            resultData = await fetchInstagram(targetUrl);
        } else if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
            resultData = await fetchYouTube(targetUrl);
        } else {
            // Universal Fallback untuk Twitter/X, Facebook, Pinterest, Bilibili, dll.
            resultData = await fetchUniversal(targetUrl);
        }

        if (resultData && resultData.url) {
            renderResult(resultData, targetUrl);
        } else {
            alert("Gagal memproses media. Pastikan tautan bersifat publik dan dicoba kembali.");
        }
    } catch (error) {
        console.error("Downloader Error:", error);
        alert("Terjadi kesalahan jaringan atau tautan tidak didukung.");
    } finally {
        showLoading(false);
    }
});

// 1. Handler TikTok / Douyin
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

// 2. Handler Instagram (Reels/Post/Photo)
async function fetchInstagram(url) {
    const apiProxy = "https://corsproxy.io/?" + encodeURIComponent(`https://api.vkrdown.com/insta/?url=${url}`);
    const res = await fetch(apiProxy);
    const json = await res.json();
    if (json.status && json.data) {
        return {
            url: json.data[0].url,
            thumb: json.data[0].thumbnail || json.data[0].url,
            title: "Instagram Media"
        };
    }
    return await fetchUniversal(url);
}

// 3. Handler YouTube (Shorts / Video)
async function fetchYouTube(url) {
    const res = await fetch(`https://api.vkrdown.com/yt/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    if (json.data && json.data.downloads) {
        return {
            url: json.data.downloads[0].url,
            thumb: json.data.thumbnail,
            title: json.data.title || "YouTube Video"
        };
    }
    return await fetchUniversal(url);
}

// 4. Handler Universal (Twitter/X, Pinterest, Facebook, dll)
async function fetchUniversal(url) {
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent("https://api.cobalt.tools/api/json");
    const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: url, videoQuality: "max" })
    });
    const json = await res.json();
    if (json && (json.url || json.picker)) {
        return {
            url: json.url || (json.picker ? json.picker[0].url : null),
            thumb: json.thumb || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
            title: "Media Download"
        };
    }
    return null;
}

// Render Hasil ke Tampilan (UI)
function renderResult(data, originalUrl) {
    mediaPreview.src = data.thumb || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
    downloadLinkMain.href = data.url;
    mediaTitle.innerText = `Media berhasil diproses dari (${new URL(originalUrl).hostname})`;
    resultCard.classList.remove("hidden");
}

// Loading Indicator Handler
function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        btnSubmit.disabled = true;
    } else {
        loadingState.classList.add("hidden");
        btnSubmit.disabled = false;
    }
}

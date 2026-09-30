/**
 * Universal Media Downloader
 * Direct API Integration (Tanpa Vercel Backend)
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
        let data = null;

        // Auto-Routing Platform
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            data = await fetchTikTok(targetUrl);
        } else if (targetUrl.includes("instagram.com")) {
            data = await fetchInstagram(targetUrl);
        } else if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
            data = await fetchYouTube(targetUrl);
        } else {
            data = await fetchUniversal(targetUrl);
        }

        if (data && data.url) {
            renderResult(data, targetUrl);
        } else {
            alert("Gagal memproses media. Pastikan tautan publik dan coba lagi.");
        }
    } catch (error) {
        console.error("Downloader Error:", error);
        alert("Terjadi kesalahan jaringan atau tautan tidak didukung.");
    } finally {
        showLoading(false);
    }
});

// 1. TikTok Engine (TikWM Direct)
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

// 2. Instagram Engine (DownloadGram Engine)
async function fetchInstagram(url) {
    try {
        const res = await fetch(`https://api.downloadgram.org/media?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json && json.url) {
            return {
                url: json.url,
                thumb: json.thumb || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
                title: "Instagram Media"
            };
        }
    } catch (e) {
        // Fallback
        return await fetchUniversal(url);
    }
    return await fetchUniversal(url);
}

// 3. YouTube Engine (VKR Public Downloader)
async function fetchYouTube(url) {
    try {
        const res = await fetch(`https://api.vkrdown.com/yt/?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.data && json.data.downloads) {
            return {
                url: json.data.downloads[0].url,
                thumb: json.data.thumbnail,
                title: json.data.title || "YouTube Video"
            };
        }
    } catch (e) {
        return await fetchUniversal(url);
    }
    return await fetchUniversal(url);
}

// 4. Universal Engine (Twitter/X, Facebook, Pinterest, Bilibili)
async function fetchUniversal(url) {
    try {
        const res = await fetch(`https://api.vkrdown.com/fetch/?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json && json.data) {
            let downloadUrl = Array.isArray(json.data) ? json.data[0].url : (json.data.url || json.data);
            if (downloadUrl) {
                return {
                    url: downloadUrl,
                    thumb: json.thumbnail || json.cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
                    title: json.title || "Media Download"
                };
            }
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}

// Render Ke Tampilan UI
function renderResult(data, originalUrl) {
    mediaPreview.src = data.thumb;
    downloadLinkMain.href = data.url;
    mediaTitle.innerText = data.title || `Media dari (${new URL(originalUrl).hostname})`;
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

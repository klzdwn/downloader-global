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
        let downloadUrl = "";
        let coverImg = "";
        let titleText = "";

        // 1. TIKTOK ENGINE
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
            const json = await res.json();
            if (json && json.data) {
                downloadUrl = json.data.play;
                coverImg = json.data.cover;
                titleText = json.data.title || "TikTok Video";
            }
        } 
        // 2. SPOTIFY ENGINE
        else if (targetUrl.includes("spotify.com")) {
            const res = await fetch(`https://api.spotifydown.com/download/${encodeURIComponent(targetUrl)}`, {
                headers: { "Origin": "https://spotifydown.com" }
            });
            const json = await res.json();
            if (json && json.success) {
                downloadUrl = json.link;
                coverImg = json.metadata.cover;
                titleText = `${json.metadata.title} - ${json.metadata.artists}`;
            }
        } 
        // 3. YOUTUBE & INSTAGRAM ENGINE (COBALT PUBLIC)
        else {
            const res = await fetch("https://api.cobalt.tools/", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: targetUrl, videoQuality: "720" })
            });
            const json = await res.json();
            if (json && (json.url || json.picker)) {
                downloadUrl = json.url || (json.picker && json.picker[0]?.url);
                coverImg = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
                titleText = `Media (${new URL(targetUrl).hostname})`;
            }
        }

        // TAMPILKAN HASIL
        if (downloadUrl) {
            downloadLinkMain.href = downloadUrl;
            mediaPreview.src = coverImg || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";
            mediaTitle.innerText = titleText;
            resultCard.classList.remove("hidden");
        } else {
            alert("Gagal memproses link. Pastikan tautan publik & valid!");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Gagal mengambil data dari server API.");
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

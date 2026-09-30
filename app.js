const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const pasteBtn = document.getElementById("pasteBtn");
const btnSubmit = document.getElementById("btnSubmit");
const loadingState = document.getElementById("loadingState");

const resultCard = document.getElementById("resultCard");
const previewContainer = document.getElementById("previewContainer");
const mediaTitle = document.getElementById("mediaTitle");
const mediaSourceTag = document.getElementById("mediaSourceTag");

const downloadBtn = document.getElementById("downloadBtn");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressStatus = document.getElementById("progressStatus");

let activeDownloadUrl = "";

// Tombol Paste Otomatis
pasteBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) urlInput.value = text;
    } catch (err) {
        alert("Izinkan akses clipboard browser untuk paste otomatis.");
    }
});

// Submit Handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();
    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");
    progressBox.classList.add("hidden");

    try {
        let downloadUrl = "";
        let coverImg = "";
        let titleText = "";
        let isVideo = true;

        // 1. TIKTOK ENGINE
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            mediaSourceTag.innerText = "TikTok";
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
            const json = await res.json();
            if (json && json.data) {
                downloadUrl = json.data.play;
                coverImg = json.data.cover;
                titleText = json.data.title || "TikTok Video";
            }
        } 
        // 2. YOUTUBE / INSTAGRAM / UNIVERSAL (COBALT PUBLIC)
        else {
            mediaSourceTag.innerText = new URL(targetUrl).hostname.replace('www.', '');
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
                coverImg = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80";
                titleText = `Media dari ${mediaSourceTag.innerText}`;
            }
        }

        if (downloadUrl) {
            activeDownloadUrl = downloadUrl;
            mediaTitle.innerText = titleText;

            // Render Preview (Video / Gambar)
            if (downloadUrl.endsWith(".mp4") || downloadUrl.includes("video") || targetUrl.includes("tiktok")) {
                previewContainer.innerHTML = `
                    <video controls src="${downloadUrl}" poster="${coverImg}" class="w-full max-h-[300px] object-contain rounded-lg"></video>
                `;
            } else {
                previewContainer.innerHTML = `
                    <img src="${coverImg || downloadUrl}" class="w-full max-h-[300px] object-contain rounded-lg" alt="Preview">
                `;
            }

            downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Unduh Langsung Ke HP`;
            downloadBtn.disabled = false;
            resultCard.classList.remove("hidden");
        } else {
            alert("Gagal mengambil media. Pastikan tautan publik dan dapat diakses.");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Gagal terhubung ke API extractor.");
    } finally {
        showLoading(false);
    }
});

// Download Handler dengan Progress 0% - 100% (Tanpa Tab Baru)
downloadBtn.addEventListener("click", () => {
    if (!activeDownloadUrl) return;

    downloadBtn.disabled = true;
    progressBox.classList.remove("hidden");
    progressBar.style.width = "0%";
    progressPercent.innerText = "0%";
    progressStatus.innerText = "Menghubungkan...";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", activeDownloadUrl, true);
    xhr.responseType = "blob";

    // Tracking Progress 0% - 100%
    xhr.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = percentComplete + "%";
            progressPercent.innerText = percentComplete + "%";
            progressStatus.innerText = `Mengunduh (${(event.loaded / (1024 * 1024)).toFixed(1)} MB / ${(event.total / (1024 * 1024)).toFixed(1)} MB)...`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Mengunduh... ${percentComplete}%`;
        } else {
            progressStatus.innerText = "Mengunduh file...";
        }
    };

    // Selesai Download -> Simpan File
    xhr.onload = () => {
        if (xhr.status === 200) {
            const blob = xhr.response;
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            
            // Tentukan ekstensi
            const isMp3 = activeDownloadUrl.includes(".mp3");
            a.download = `MediaGrab_${Date.now()}.${isMp3 ? 'mp3' : 'mp4'}`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

            progressStatus.innerText = "Selesai!";
            downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> Unduhan Selesai`;
            downloadBtn.disabled = false;
        } else {
            alert("Gagal mengunduh file media.");
            downloadBtn.disabled = false;
        }
    };

    xhr.onerror = () => {
        alert("Terjadi kesalahan jaringan saat mengunduh.");
        downloadBtn.disabled = false;
    };

    xhr.send();
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

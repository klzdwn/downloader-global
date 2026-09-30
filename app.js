const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const pasteBtn = document.getElementById("pasteBtn");
const btnSubmit = document.getElementById("btnSubmit");
const loadingState = document.getElementById("loadingState");

const resultCard = document.getElementById("resultCard");
const previewContainer = document.getElementById("previewContainer");
const mediaTitle = document.getElementById("mediaTitle");
const mediaSourceTag = document.getElementById("mediaSourceTag");
const resolutionSelectorContainer = document.getElementById("resolutionSelectorContainer");

const downloadBtn = document.getElementById("downloadBtn");
const backBtn = document.getElementById("backBtn");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressStatus = document.getElementById("progressStatus");

let activeDownloadUrl = "";
let currentMediaType = "video"; // 'video' atau 'image'

// Paste Button
pasteBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) urlInput.value = text;
    } catch (err) {
        alert("Izinkan akses clipboard di browser.");
    }
});

// Tombol Kembali / Reset
backBtn.addEventListener("click", () => {
    resultCard.classList.add("hidden");
    urlInput.value = "";
    urlInput.focus();
});

// Form Submit
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

        // 1. TIKTOK ENGINE
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            mediaSourceTag.innerText = "TikTok";
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
            const json = await res.json();
            if (json && json.data) {
                downloadUrl = json.data.play;
                coverImg = json.data.cover;
                titleText = json.data.title || "TikTok Video";
                currentMediaType = "video";
            }
        } 
        // 2. YOUTUBE / INSTAGRAM / UNIVERSAL
        else {
            mediaSourceTag.innerText = new URL(targetUrl).hostname.replace('www.', '');
            const res = await fetch("https://api.cobalt.tools/", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: targetUrl, videoQuality: "1080" })
            });
            const json = await res.json();
            if (json && (json.url || json.picker)) {
                downloadUrl = json.url || (json.picker && json.picker[0]?.url);
                coverImg = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80";
                titleText = `Media dari ${mediaSourceTag.innerText}`;
                
                // Deteksi tipe media
                if (targetUrl.includes("instagram.com/p/") && !downloadUrl.includes(".mp4")) {
                    currentMediaType = "image";
                } else {
                    currentMediaType = "video";
                }
            }
        }

        if (downloadUrl) {
            activeDownloadUrl = downloadUrl;
            mediaTitle.innerText = titleText;

            // Render Preview & Selector Resolusi
            if (currentMediaType === "video") {
                previewContainer.innerHTML = `
                    <video controls src="${downloadUrl}" poster="${coverImg}" class="w-full max-h-[300px] object-contain rounded-lg"></video>
                `;
                
                // Tampilan Pilihan Resolusi Video
                resolutionSelectorContainer.innerHTML = `
                    <select id="resSelect" class="w-full bg-gray-900 border border-purple-500/30 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500">
                        <option value="1080">1080p (Ultra HD)</option>
                        <option value="720" selected>720p (HD Standard)</option>
                        <option value="480">480p (SD Low)</option>
                    </select>
                `;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Unduh Video`;

            } else {
                previewContainer.innerHTML = `
                    <img src="${coverImg || downloadUrl}" class="w-full max-h-[300px] object-contain rounded-lg" alt="Preview">
                `;
                
                // Tampilan Badge Resolusi Foto
                resolutionSelectorContainer.innerHTML = `
                    <div class="w-full bg-gray-900 border border-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between">
                        <span><i class="fa-regular fa-image"></i> Resolusi Foto</span>
                        <span class="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-500/30">Full HD Original</span>
                    </div>
                `;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Unduh Foto`;
            }

            downloadBtn.disabled = false;
            resultCard.classList.remove("hidden");
        } else {
            alert("Gagal mengambil media. Pastikan tautan publik dan valid.");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Terjadi kesalahan saat mengekstrak media.");
    } finally {
        showLoading(false);
    }
});

// Download Process dengan Pace Progress yang Halus & Tidak Cepat
downloadBtn.addEventListener("click", () => {
    if (!activeDownloadUrl) return;

    downloadBtn.disabled = true;
    progressBox.classList.remove("hidden");
    
    let currentPercent = 0;
    progressBar.style.width = "0%";
    progressPercent.innerText = "0%";
    progressStatus.innerText = "Menyiapkan file...";

    // Interval Simulasi Progress Bertahap (Mulus)
    const progressInterval = setInterval(() => {
        if (currentPercent < 90) {
            // Tambah random 2-6% per interval
            currentPercent += Math.floor(Math.random() * 5) + 2;
            if (currentPercent > 90) currentPercent = 90;

            progressBar.style.width = currentPercent + "%";
            progressPercent.innerText = currentPercent + "%";
            progressStatus.innerText = `Mengunduh (${currentPercent}%)...`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Mengunduh... ${currentPercent}%`;
        }
    }, 180);

    // Ambil File Blob
    const xhr = new XMLHttpRequest();
    xhr.open("GET", activeDownloadUrl, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
        clearInterval(progressInterval);

        if (xhr.status === 200) {
            // Naikkan langsung ke 100% pas selesai
            progressBar.style.width = "100%";
            progressPercent.innerText = "100%";
            progressStatus.innerText = "Selesai!";

            const blob = xhr.response;
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            
            const ext = currentMediaType === "video" ? "mp4" : "jpg";
            a.download = `MediaGrab_${Date.now()}.${ext}`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

            const labelText = currentMediaType === "video" ? "Unduh Video" : "Unduh Foto";
            downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> Unduhan Selesai`;
            
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> ${labelText}`;
            }, 2500);

        } else {
            alert("Gagal mengunduh file media.");
            downloadBtn.disabled = false;
        }
    };

    xhr.onerror = () => {
        clearInterval(progressInterval);
        alert("Terjadi masalah koneksi saat mengunduh.");
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

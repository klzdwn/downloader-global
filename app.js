const form = document.getElementById("downloadForm");
const urlInput = document.getElementById("urlInput");
const pasteBtn = document.getElementById("pasteBtn");
const btnSubmit = document.getElementById("btnSubmit");
const loadingState = document.getElementById("loadingState");

const resultCard = document.getElementById("resultCard");
const previewContainer = document.getElementById("previewContainer");
const mediaMetaInfo = document.getElementById("mediaMetaInfo");
const mediaTitle = document.getElementById("mediaTitle");
const mediaSourceTag = document.getElementById("mediaSourceTag");
const resolutionSelectorContainer = document.getElementById("resolutionSelectorContainer");

const downloadBtn = document.getElementById("downloadBtn");
const backBtn = document.getElementById("backBtn");
const progressBox = document.getElementById("progressBox");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressStatus = document.getElementById("progressStatus");

// Toast Elements
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
let toastTimeout;

// State Management
let activeDownloadUrl = "";
let currentMediaType = "video"; // 'video' atau 'image'
let slideImages = [];
let currentSlideIndex = 0;

// Fungsi Custom Toast Notification
function showToast(message) {
    clearTimeout(toastTimeout);
    toastMessage.innerText = message;
    
    toast.classList.remove("-translate-y-20", "opacity-0", "pointer-events-none");
    toast.classList.add("translate-y-0", "opacity-100");

    toastTimeout = setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("-translate-y-20", "opacity-0", "pointer-events-none");
}

// Helper Format Detik ke MM:SS
function formatDuration(seconds) {
    if (!seconds || seconds === 0) return "Photo";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Navigasi Slide Foto
window.changeSlide = function(direction) {
    if (slideImages.length === 0) return;
    
    currentSlideIndex += direction;
    if (currentSlideIndex < 0) currentSlideIndex = slideImages.length - 1;
    if (currentSlideIndex >= slideImages.length) currentSlideIndex = 0;

    renderSlideView();
};

// Update Tampilan Gambar Slide Aktif & Tombol Unduh
function renderSlideView() {
    activeDownloadUrl = slideImages[currentSlideIndex];

    previewContainer.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center group">
            <img src="${activeDownloadUrl}" class="w-full max-h-[300px] object-contain rounded-lg p-1 transition-all duration-300" alt="Slide ${currentSlideIndex + 1}">
            
            ${slideImages.length > 1 ? `
                <!-- Tombol Prev -->
                <button onclick="changeSlide(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg">
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                </button>
                
                <!-- Tombol Next -->
                <button onclick="changeSlide(1)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>

                <!-- Indicator Slide -->
                <div class="absolute bottom-2 bg-black/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    ${currentSlideIndex + 1} /${slideImages.length}
                </div>
            ` : ''}
        </div>
    `;

    // Dynamic Label Tombol Download sesuai Slide
    downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Unduh Foto ${currentSlideIndex + 1}`;
}

// Paste Button
pasteBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) urlInput.value = text;
    } catch (err) {
        showToast("Izinkan akses clipboard di browser HP kamu.");
    }
});

// Tombol Kembali
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
    slideImages = [];
    currentSlideIndex = 0;

    try {
        let downloadUrl = "";
        let coverImg = "";
        let titleText = "";
        let username = "@user";
        let durationText = "0:00";
        let originalRes = "1080p";

        // 1. TIKTOK ENGINE
        if (targetUrl.includes("tiktok.com") || targetUrl.includes("douyin.com")) {
            mediaSourceTag.innerText = "TikTok";
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}`);
            const json = await res.json();

            if (json && json.data) {
                username = json.data.author?.unique_id ? `@${json.data.author.unique_id}` : "@tiktok";
                titleText = json.data.title || "TikTok Content";

                // DETEKSI APAKAH SLIDE FOTO ATAU VIDEO
                if (json.data.images && json.data.images.length > 0) {
                    currentMediaType = "image";
                    slideImages = json.data.images;
                    downloadUrl = slideImages[0];
                    durationText = `${slideImages.length} Foto Slide`;
                    originalRes = "Full HD";
                } else {
                    currentMediaType = "video";
                    downloadUrl = json.data.play;
                    coverImg = json.data.cover;
                    durationText = formatDuration(json.data.duration);
                    originalRes = (json.data.wm_size || json.data.hd_size) ? "1080x1920" : "1080p HD";
                }
            }
        } 
        // 2. OTHER ENGINES (Instagram, YouTube, etc)
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
                if (json.picker && json.picker.length > 0) {
                    currentMediaType = "image";
                    slideImages = json.picker.map(item => item.url);
                    downloadUrl = slideImages[0];
                    durationText = `${slideImages.length} Photo`;
                    originalRes = "Full HD";
                } else {
                    downloadUrl = json.url;
                    titleText = `Media dari ${mediaSourceTag.innerText}`;
                    username = "@creator";
                    
                    if (targetUrl.includes("instagram.com/p/") || !downloadUrl.includes(".mp4")) {
                        currentMediaType = "image";
                        slideImages = [downloadUrl];
                        durationText = "Photo";
                        originalRes = "Full HD";
                    } else {
                        currentMediaType = "video";
                        durationText = "Auto";
                        originalRes = "1080p HD";
                    }
                }
            }
        }

        if (downloadUrl) {
            activeDownloadUrl = downloadUrl;
            mediaTitle.innerText = titleText;

            // Render Meta Info (Username, Tipe/Durasi, Resolusi)
            mediaMetaInfo.innerHTML = `
                <div class="bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-center">
                    <p class="text-[10px] text-gray-400">Username</p>
                    <p class="text-xs font-semibold text-purple-300 truncate">${username}</p>
                </div>
                <div class="bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-center">
                    <p class="text-[10px] text-gray-400">${currentMediaType === 'image' ? 'Tipe' : 'Durasi'}</p>
                    <p class="text-xs font-semibold text-emerald-400">${durationText}</p>
                </div>
                <div class="bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-center">
                    <p class="text-[10px] text-gray-400">Resolusi Asli</p>
                    <p class="text-xs font-semibold text-blue-400">${originalRes}</p>
                </div>
            `;

            // Tampilan VIDEO vs FOTO SLIDE
            if (currentMediaType === "video") {
                previewContainer.innerHTML = `
                    <video controls src="${downloadUrl}" poster="${coverImg}" class="w-full max-h-[300px] object-contain rounded-lg"></video>
                `;
                
                resolutionSelectorContainer.innerHTML = `
                    <select id="resSelect" class="w-full bg-gray-900 border border-purple-500/30 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500">
                        <option value="1080">1080p (Ultra HD)</option>
                        <option value="720" selected>720p (HD Standard)</option>
                        <option value="480">480p (SD Low)</option>
                    </select>
                `;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Unduh Video`;

            } else {
                // RENDER SLIDE FOTO
                renderSlideView();
                
                resolutionSelectorContainer.innerHTML = `
                    <div class="w-full bg-gray-900 border border-purple-500/20 text-purple-300 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between">
                        <span><i class="fa-regular fa-image"></i> Kualitas Gambar</span>
                        <span class="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-500/30">Full HD Original</span>
                    </div>
                `;
            }

            downloadBtn.disabled = false;
            resultCard.classList.remove("hidden");
        } else {
            showToast("Gagal mengambil media. Pastikan tautan publik dan valid.");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        showToast("Terjadi kesalahan koneksi saat mengekstrak media.");
    } finally {
        showLoading(false);
    }
});

// Download Process Single Photo / Video
downloadBtn.addEventListener("click", () => {
    if (!activeDownloadUrl) return;

    downloadBtn.disabled = true;
    progressBox.classList.remove("hidden");
    
    let currentPercent = 0;
    progressBar.style.width = "0%";
    progressPercent.innerText = "0%";
    progressStatus.innerText = "Menyiapkan file...";

    const progressInterval = setInterval(() => {
        if (currentPercent < 90) {
            currentPercent += Math.floor(Math.random() * 5) + 2;
            if (currentPercent > 90) currentPercent = 90;

            progressBar.style.width = currentPercent + "%";
            progressPercent.innerText = currentPercent + "%";
            progressStatus.innerText = `Mengunduh (${currentPercent}%)...`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Mengunduh... ${currentPercent}%`;
        }
    }, 180);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", activeDownloadUrl, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
        clearInterval(progressInterval);

        if (xhr.status === 200) {
            progressBar.style.width = "100%";
            progressPercent.innerText = "100%";
            progressStatus.innerText = "Selesai!";

            const blob = xhr.response;
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            
            const ext = currentMediaType === "video" ? "mp4" : "jpg";
            const fileSuffix = currentMediaType === "image" && slideImages.length > 0 ? `_slide_${currentSlideIndex + 1}` : '';
            a.download = `MediaGrab_${Date.now()}${fileSuffix}.${ext}`;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

            const labelText = currentMediaType === "video" ? "Unduh Video" : `Unduh Foto ${currentSlideIndex + 1}`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> Unduhan Selesai`;
            
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> ${labelText}`;
            }, 2500);

        } else {
            showToast("Gagal mengunduh file media dari server.");
            downloadBtn.disabled = false;
        }
    };

    xhr.onerror = () => {
        clearInterval(progressInterval);
        showToast("Terjadi masalah jaringan saat mengunduh.");
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

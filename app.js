// Dictionary Bahasa (ID, EN, MS)
const translations = {
    id: {
        heroBadge: "Multi-Platform Global Downloader",
        heroTitle1: "Download Video & Foto",
        heroTitle2: "Tanpa Watermark HD",
        heroSubtitle: "Unduh konten dari TikTok, Instagram, YouTube, Twitter/X, Pinterest & platform global lainnya secara instan.",
        inputPlaceholder: "Tempel tautan video/foto di sini...",
        pasteBtn: "Paste",
        processBtn: "Process Media",
        loadingText: "Sedang mengekstrak media dari server...",
        mediaFound: "Media Ditemukan",
        qualityLabel: "Pilih Kualitas / Resolusi:",
        downloadVideo: "Unduh Video",
        downloadPhoto: "Unduh Foto",
        downloadPhotoSlide: "Unduh Foto",
        backBtn: "Kembali & Tempel Link Lain",
        clipboardError: "Izinkan akses clipboard di browser HP kamu.",
        fetchError: "Gagal mengambil media. Pastikan tautan publik dan valid.",
        connError: "Terjadi kesalahan koneksi saat mengekstrak media.",
        downloading: "Mengunduh",
        preparing: "Menyiapkan file...",
        finished: "Selesai!",
        downloadComplete: "Unduhan Selesai",
        toastTitle: "Terjadi Kesalahan",
        photoQuality: "Kualitas Gambar",
        fullHdOrig: "Full HD Original",
        usernameLabel: "Username",
        typeLabel: "Tipe",
        durationLabel: "Durasi",
        resLabel: "Resolusi Asli",
        photoSlideTag: "Foto Slide"
    },
    en: {
        heroBadge: "Multi-Platform Global Downloader",
        heroTitle1: "Download Video & Photos",
        heroTitle2: "Without Watermark HD",
        heroSubtitle: "Download content instantly from TikTok, Instagram, YouTube, Twitter/X, Pinterest & other global platforms.",
        inputPlaceholder: "Paste video/photo link here...",
        pasteBtn: "Paste",
        processBtn: "Process Media",
        loadingText: "Extracting media from server...",
        mediaFound: "Media Found",
        qualityLabel: "Select Quality / Resolution:",
        downloadVideo: "Download Video",
        downloadPhoto: "Download Photo",
        downloadPhotoSlide: "Download Photo",
        backBtn: "Back & Paste Another Link",
        clipboardError: "Allow clipboard access in your browser.",
        fetchError: "Failed to fetch media. Make sure link is public and valid.",
        connError: "Connection error while extracting media.",
        downloading: "Downloading",
        preparing: "Preparing file...",
        finished: "Finished!",
        downloadComplete: "Download Complete",
        toastTitle: "An Error Occurred",
        photoQuality: "Image Quality",
        fullHdOrig: "Full HD Original",
        usernameLabel: "Username",
        typeLabel: "Type",
        durationLabel: "Duration",
        resLabel: "Original Res",
        photoSlideTag: "Photo Slide"
    },
    ms: {
        heroBadge: "Pemuat Turun Global Pelbagai Platform",
        heroTitle1: "Muat Turun Video & Foto",
        heroTitle2: "Tanpa Watermark HD",
        heroSubtitle: "Muat turun kandungan dari TikTok, Instagram, YouTube, Twitter/X, Pinterest & platform lain secara segera.",
        inputPlaceholder: "Tampal pautan video/foto di sini...",
        pasteBtn: "Tampal",
        processBtn: "Proses Media",
        loadingText: "Mengekstrak media daripada pelayan...",
        mediaFound: "Media Ditemui",
        qualityLabel: "Pilih Kualiti / Resolusi:",
        downloadVideo: "Muat Turun Video",
        downloadPhoto: "Muat Turun Foto",
        downloadPhotoSlide: "Muat Turun Foto",
        backBtn: "Kembali & Tampal Pautan Lain",
        clipboardError: "Benarkan akses papan keratan pada penyemak imbas anda.",
        fetchError: "Gagal mengambil media. Pastikan pautan adalah awam dan sah.",
        connError: "Ralat sambungan semasa mengekstrak media.",
        downloading: "Memuat turun",
        preparing: "Menyediakan fail...",
        finished: "Selesai!",
        downloadComplete: "Muat Turun Selesai",
        toastTitle: "Ralat Berlaku",
        photoQuality: "Kualiti Gambar",
        fullHdOrig: "Full HD Asal",
        usernameLabel: "Nama Pengguna",
        typeLabel: "Jenis",
        durationLabel: "Masa",
        resLabel: "Resolusi Asal",
        photoSlideTag: "Slaid Foto"
    }
};

// State Variables
let currentLang = localStorage.getItem("app_lang") || "id";
let activeDownloadUrl = "";
let currentMediaType = "video";
let slideImages = [];
let currentSlideIndex = 0;

// DOM Elements
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

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
let toastTimeout;

// ------------------- DARK / LIGHT MODE -------------------
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");

function initTheme() {
    const savedTheme = localStorage.getItem("app_theme") || "dark";
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        themeIcon.className = "fa-solid fa-sun text-amber-400 text-xs";
    } else {
        document.documentElement.classList.remove("dark");
        themeIcon.className = "fa-solid fa-moon text-gray-700 text-xs";
    }
}

themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("app_theme", isDark ? "dark" : "light");
    themeIcon.className = isDark ? "fa-solid fa-sun text-amber-400 text-xs" : "fa-solid fa-moon text-gray-700 text-xs";
});

// ------------------- LANGUAGE SWITCHER -------------------
const langSelect = document.getElementById("langSelect");

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("app_lang", lang);
    langSelect.value = lang;

    const t = translations[lang];

    document.getElementById("heroBadge").innerText = t.heroBadge;
    document.getElementById("heroTitle1").innerText = t.heroTitle1;
    document.getElementById("heroTitle2").innerText = t.heroTitle2;
    document.getElementById("heroSubtitle").innerText = t.heroSubtitle;
    document.getElementById("urlInput").placeholder = t.inputPlaceholder;
    document.getElementById("pasteBtnText").innerText = t.pasteBtn;
    document.getElementById("btnSubmitText").innerText = t.processBtn;
    document.getElementById("loadingText").innerText = t.loadingText;
    document.getElementById("mediaFoundLabel").innerHTML = `<i class="fa-solid fa-circle-check"></i> ${t.mediaFound}`;
    document.getElementById("qualityLabel").innerHTML = `<i class="fa-solid fa-sliders text-purple-500"></i> ${t.qualityLabel}`;
    document.getElementById("backBtnText").innerText = t.backBtn;
    document.getElementById("toastTitle").innerText = t.toastTitle;

    // Refresh dynamic labels if result is active
    if (!resultCard.classList.contains("hidden")) {
        if (currentMediaType === "video") {
            document.getElementById("downloadBtnText").innerText = t.downloadVideo;
        } else {
            document.getElementById("downloadBtnText").innerText = `${t.downloadPhotoSlide} ${currentSlideIndex + 1}`;
        }
    }
}

langSelect.addEventListener("change", (e) => {
    applyLanguage(e.target.value);
});

// ------------------- UTILS & TOAST -------------------
function showToast(messageKey) {
    const t = translations[currentLang];
    clearTimeout(toastTimeout);
    toastMessage.innerText = t[messageKey] || messageKey;
    
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

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return "Photo";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ------------------- SLIDER CAROUSEL -------------------
window.scrollSlide = function(direction) {
    const slider = document.getElementById("imageCarousel");
    if (!slider) return;

    const newIndex = currentSlideIndex + direction;
    if (newIndex >= 0 && newIndex < slideImages.length) {
        slider.scrollTo({
            left: slider.clientWidth * newIndex,
            behavior: "smooth"
        });
    }
};

function handleCarouselScroll() {
    const slider = document.getElementById("imageCarousel");
    if (!slider) return;

    const newIndex = Math.round(slider.scrollLeft / slider.clientWidth);
    if (newIndex !== currentSlideIndex && newIndex >= 0 && newIndex < slideImages.length) {
        currentSlideIndex = newIndex;
        activeDownloadUrl = slideImages[currentSlideIndex];

        const counter = document.getElementById("slideCounter");
        if (counter) counter.innerText = `${currentSlideIndex + 1} / ${slideImages.length}`;

        const t = translations[currentLang];
        document.getElementById("downloadBtnText").innerText = `${t.downloadPhotoSlide} ${currentSlideIndex + 1}`;
    }
}

function renderSlideView() {
    const t = translations[currentLang];
    currentSlideIndex = 0;
    activeDownloadUrl = slideImages[0];

    let slidesHtml = slideImages.map((imgUrl, index) => `
        <div class="w-full flex-shrink-0 snap-center flex items-center justify-center p-2 min-h-[250px] max-h-[380px]">
            <img src="${imgUrl}" class="max-w-full max-h-[360px] w-auto h-auto object-contain rounded-lg shadow-md" alt="Slide ${index + 1}">
        </div>
    `).join('');

    previewContainer.innerHTML = `
        <div class="relative w-full overflow-hidden group">
            <div id="imageCarousel" onscroll="handleCarouselScroll()" class="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
                ${slidesHtml}
            </div>

            ${slideImages.length > 1 ? `
                <button onclick="scrollSlide(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-9 h-9 rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90 shadow-xl z-10">
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                </button>
                
                <button onclick="scrollSlide(1)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-9 h-9 rounded-full flex items-center justify-center border border-white/20 transition-all active:scale-90 shadow-xl z-10">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>

                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 backdrop-blur-md z-10 shadow-lg">
                    <span id="slideCounter">1 / ${slideImages.length}</span>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById("downloadBtnText").innerText = `${t.downloadPhotoSlide} 1`;
}

// ------------------- EVENT LISTENERS -------------------
pasteBtn.addEventListener("click", async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) urlInput.value = text;
    } catch (err) {
        showToast("clipboardError");
    }
});

backBtn.addEventListener("click", () => {
    resultCard.classList.add("hidden");
    urlInput.value = "";
    urlInput.focus();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const targetUrl = urlInput.value.trim();
    if (!targetUrl) return;

    showLoading(true);
    resultCard.classList.add("hidden");
    progressBox.classList.add("hidden");
    slideImages = [];
    currentSlideIndex = 0;

    const t = translations[currentLang];

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

                if (json.data.images && json.data.images.length > 0) {
                    currentMediaType = "image";
                    slideImages = json.data.images;
                    downloadUrl = slideImages[0];
                    durationText = `${slideImages.length} ${t.photoSlideTag}`;
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
        // 2. OTHER ENGINES
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

            // Badge Metadata Adaptif Tema
            mediaMetaInfo.innerHTML = `
                <div class="bg-gray-100/80 dark:bg-gray-900/80 p-2 rounded-xl border border-gray-200/80 dark:border-gray-800 text-center transition-colors">
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">${t.usernameLabel}</p>
                    <p class="text-xs font-semibold text-purple-600 dark:text-purple-300 truncate">${username}</p>
                </div>
                <div class="bg-gray-100/80 dark:bg-gray-900/80 p-2 rounded-xl border border-gray-200/80 dark:border-gray-800 text-center transition-colors">
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">${currentMediaType === 'image' ? t.typeLabel : t.durationLabel}</p>
                    <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">${durationText}</p>
                </div>
                <div class="bg-gray-100/80 dark:bg-gray-900/80 p-2 rounded-xl border border-gray-200/80 dark:border-gray-800 text-center transition-colors">
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">${t.resLabel}</p>
                    <p class="text-xs font-semibold text-blue-600 dark:text-blue-400">${originalRes}</p>
                </div>
            `;

            if (currentMediaType === "video") {
                previewContainer.innerHTML = `
                    <video controls src="${downloadUrl}" poster="${coverImg}" class="w-full max-h-[340px] object-contain rounded-lg p-1"></video>
                `;
                
                // Select Resolusi Adaptif Tema
                resolutionSelectorContainer.innerHTML = `
                    <select id="resSelect" class="w-full bg-gray-100/80 dark:bg-gray-900 border border-gray-300 dark:border-purple-500/30 text-gray-900 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 transition-colors">
                        <option value="1080">1080p (Ultra HD)</option>
                        <option value="720" selected>720p (HD Standard)</option>
                        <option value="480">480p (SD Low)</option>
                    </select>
                `;
                document.getElementById("downloadBtnText").innerText = t.downloadVideo;

            } else {
                renderSlideView();
                
                // Badge Kualitas Gambar Adaptif Tema
                resolutionSelectorContainer.innerHTML = `
                    <div class="w-full bg-gray-100/80 dark:bg-gray-900 border border-gray-200/80 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors">
                        <span><i class="fa-regular fa-image"></i> ${t.photoQuality}</span>
                        <span class="bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-500/30">${t.fullHdOrig}</span>
                    </div>
                `;
            }

            downloadBtn.disabled = false;
            resultCard.classList.remove("hidden");
        } else {
            showToast("fetchError");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        showToast("connError");
    } finally {
        showLoading(false);
    }
});

// Download Action
downloadBtn.addEventListener("click", () => {
    if (!activeDownloadUrl) return;

    const t = translations[currentLang];
    downloadBtn.disabled = true;
    progressBox.classList.remove("hidden");
    
    let currentPercent = 0;
    progressBar.style.width = "0%";
    progressPercent.innerText = "0%";
    progressStatus.innerText = t.preparing;

    const progressInterval = setInterval(() => {
        if (currentPercent < 90) {
            currentPercent += Math.floor(Math.random() * 5) + 2;
            if (currentPercent > 90) currentPercent = 90;

            progressBar.style.width = currentPercent + "%";
            progressPercent.innerText = currentPercent + "%";
            progressStatus.innerText = `${t.downloading} (${currentPercent}%)...`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> ${t.downloading}... ${currentPercent}%`;
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
            progressStatus.innerText = t.finished;

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

            const labelText = currentMediaType === "video" ? t.downloadVideo : `${t.downloadPhotoSlide} ${currentSlideIndex + 1}`;
            downloadBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${t.downloadComplete}`;
            
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> <span id="downloadBtnText">${labelText}</span>`;
            }, 2500);

        } else {
            showToast("fetchError");
            downloadBtn.disabled = false;
        }
    };

    xhr.onerror = () => {
        clearInterval(progressInterval);
        showToast("connError");
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

// Initialize Theme & Language on Load
initTheme();
applyLanguage(currentLang);

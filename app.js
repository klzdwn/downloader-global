// ==========================================
// 1. STATE & GLOBAL VARIABLES
// ==========================================
let currentTheme = localStorage.getItem("app_theme") || "dark";
let currentLang = localStorage.getItem("app_lang") || "id";
let downloadAbortController = null; // Controller untuk membatalkan fetch download

// Dictionary Bahasa
const translations = {
    id: {
        heroBadge: '<i class="fa-solid fa-layer-group text-[10px]"></i> Multi-Platform Global Downloader',
        heroTitle1: 'Download Video & Foto',
        heroTitle2: 'Tanpa Watermark HD',
        heroSubtitle: 'Unduh konten dari TikTok, Instagram, YouTube, Twitter/X, Pinterest & platform global lainnya secara instan.',
        placeholder: 'Tempel tautan video/foto di sini...',
        pasteBtn: 'Paste',
        btnSubmit: 'Process Media',
        loadingText: 'Sedang mengekstrak media dari server...',
        mediaFound: '<i class="fa-solid fa-circle-check"></i> Media Ditemukan',
        qualityLabel: '<i class="fa-solid fa-sliders text-indigo-500 dark:text-indigo-400"></i> Pilih Kualitas / Resolusi:',
        downloadBtn: 'Unduh Video',
        backBtn: 'Kembali & Tempel Link Lain',
        progressStatus: 'Proses Unduh...',
        cancelBtn: 'Batal Unduh',
        toastErrorTitle: 'Terjadi Kesalahan',
        toastCancelled: 'Pengunduhan Dibatalkan',
        toastCancelledMsg: 'Proses pengunduhan media telah dibatalkan.'
    },
    en: {
        heroBadge: '<i class="fa-solid fa-layer-group text-[10px]"></i> Multi-Platform Global Downloader',
        heroTitle1: 'Download Video & Photo',
        heroTitle2: 'No Watermark HD',
        heroSubtitle: 'Download content from TikTok, Instagram, YouTube, Twitter/X, Pinterest & other global platforms instantly.',
        placeholder: 'Paste video/photo link here...',
        pasteBtn: 'Paste',
        btnSubmit: 'Process Media',
        loadingText: 'Extracting media from server...',
        mediaFound: '<i class="fa-solid fa-circle-check"></i> Media Found',
        qualityLabel: '<i class="fa-solid fa-sliders text-indigo-500 dark:text-indigo-400"></i> Select Quality / Resolution:',
        downloadBtn: 'Download Video',
        backBtn: 'Back & Paste Another Link',
        progressStatus: 'Downloading...',
        cancelBtn: 'Cancel Download',
        toastErrorTitle: 'Error Occurred',
        toastCancelled: 'Download Cancelled',
        toastCancelledMsg: 'The media download process has been cancelled.'
    },
    ms: {
        heroBadge: '<i class="fa-solid fa-layer-group text-[10px]"></i> Pengunduh Global Multi-Platform',
        heroTitle1: 'Muat Turun Video & Foto',
        heroTitle2: 'Tanpa Tanda Air HD',
        heroSubtitle: 'Muat turun kandungan daripada TikTok, Instagram, YouTube, Twitter/X, Pinterest & platform global lain secara paparan instan.',
        placeholder: 'Tampal pautan video/foto di sini...',
        pasteBtn: 'Tampal',
        btnSubmit: 'Proses Media',
        loadingText: 'Mengekstrak media daripada pelayan...',
        mediaFound: '<i class="fa-solid fa-circle-check"></i> Media Ditemui',
        qualityLabel: '<i class="fa-solid fa-sliders text-indigo-500 dark:text-indigo-400"></i> Pilih Kualiti / Resolusi:',
        downloadBtn: 'Muat Turun Video',
        backBtn: 'Kembali & Tampal Pautan Lain',
        progressStatus: 'Proses Memuat Turun...',
        cancelBtn: 'Batal Muat Turun',
        toastErrorTitle: 'Ralat Berlaku',
        toastCancelled: 'Muat Turun Dibatalkan',
        toastCancelledMsg: 'Proses muat turun media telah dibatalkan.'
    }
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const langSelect = document.getElementById('langSelect');

const downloadForm = document.getElementById('downloadForm');
const urlInput = document.getElementById('urlInput');
const pasteBtn = document.getElementById('pasteBtn');
const btnSubmit = document.getElementById('btnSubmit');
const loadingState = document.getElementById('loadingState');

const inputCard = document.getElementById('inputCard');
const resultCard = document.getElementById('resultCard');
const previewContainer = document.getElementById('previewContainer');
const mediaMetaInfo = document.getElementById('mediaMetaInfo');
const mediaTitle = document.getElementById('mediaTitle');
const mediaSourceTag = document.getElementById('mediaSourceTag');
const resolutionSelectorContainer = document.getElementById('resolutionSelectorContainer');

const downloadBtn = document.getElementById('downloadBtn');
const backBtn = document.getElementById('backBtn');
const cancelBtn = document.getElementById('cancelBtn');

const progressBox = document.getElementById('progressBox');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');

const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

// ==========================================
// 3. INITIALIZATION & THEME/LANG LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Setup Theme
    applyTheme(currentTheme);

    // Setup Language
    langSelect.value = currentLang;
    applyLanguage(currentLang);

    // Event Switch Theme
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('app_theme', currentTheme);
        applyTheme(currentTheme);
    });

    // Event Switch Language
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('app_lang', currentLang);
        applyLanguage(currentLang);
    });
});

function applyTheme(theme) {
    if (theme === 'dark') {
        htmlEl.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun text-amber-400 text-sm';
    } else {
        htmlEl.classList.remove('dark');
        themeIcon.className = 'fa-solid fa-moon text-slate-700 text-sm';
    }
}

function applyLanguage(lang) {
    const t = translations[lang] || translations.id;
    document.getElementById('heroBadge').innerHTML = t.heroBadge;
    document.getElementById('heroTitle1').innerText = t.heroTitle1;
    document.getElementById('heroTitle2').innerText = t.heroTitle2;
    document.getElementById('heroSubtitle').innerText = t.heroSubtitle;
    urlInput.placeholder = t.placeholder;
    document.getElementById('pasteBtnText').innerText = t.pasteBtn;
    document.getElementById('btnSubmitText').innerText = t.btnSubmit;
    document.getElementById('loadingText').innerText = t.loadingText;
    document.getElementById('mediaFoundLabel').innerHTML = t.mediaFound;
    document.getElementById('qualityLabel').innerHTML = t.qualityLabel;
    document.getElementById('downloadBtnText').innerText = t.downloadBtn;
    document.getElementById('backBtnText').innerText = t.backBtn;
    document.getElementById('progressStatus').innerText = t.progressStatus;
    if (cancelBtn) cancelBtn.querySelector('span').innerText = t.cancelBtn;
}

// ==========================================
// 4. HANDLERS: PASTE & FORM SUBMIT
// ==========================================
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            urlInput.value = text;
        }
    } catch (err) {
        showToast("Error", "Gagal mengakses clipboard device.");
    }
});

downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    // UI Loading
    loadingState.classList.remove('hidden');
    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-50');

    try {
        // SIMULASI API FETCH (Ganti URL ini dengan Endpoint API Backend kamu)
        // Contoh: const res = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        
        // Simulasi delay response 1.5 detik
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Data tiruan media (Mock Data)
        const mockData = {
            title: "Risa - Trending Video TikTok Clean Version HD",
            source: "TikTok",
            author: "@risaalah_",
            duration: "0:14",
            originalRes: "1080p HD",
            previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            downloadOptions: [
                { label: "1080p HD (No Watermark)", url: "https://dummyjson.com/carts" },
                { label: "720p (HD Standard)", url: "https://dummyjson.com/carts" },
                { label: "MP3 Audio Only", url: "https://dummyjson.com/carts" }
            ]
        };

        renderResultCard(mockData);

    } catch (err) {
        showToast(translations[currentLang].toastErrorTitle, "Gagal memproses media. Pastikan tautan valid.");
    } finally {
        loadingState.classList.add('hidden');
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('opacity-50');
    }
});

// ==========================================
// 5. RENDER RESULT & PREVIEW
// ==========================================
function renderResultCard(data) {
    // Hide input form state, Show Result Card
    inputCard.classList.add('hidden');
    resultCard.classList.remove('hidden');

    mediaTitle.innerText = data.title;
    mediaSourceTag.innerText = data.source;

    // Render Preview
    previewContainer.innerHTML = `
        <img src="${data.previewUrl}" class="w-full h-56 object-cover rounded-xl" alt="Preview">
        <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
                <i class="fa-solid fa-play text-lg ml-0.5"></i>
            </div>
        </div>
    `;

    // Render Meta Info Badges
    mediaMetaInfo.innerHTML = `
        <div class="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <p class="text-[10px] text-slate-400">Username</p>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${data.author}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <p class="text-[10px] text-slate-400">Durasi</p>
            <p class="text-xs font-bold text-emerald-500">${data.duration}</p>
        </div>
        <div class="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <p class="text-[10px] text-slate-400">Resolusi Asli</p>
            <p class="text-xs font-bold text-indigo-500 dark:text-indigo-400">${data.originalRes}</p>
        </div>
    `;

    // Render Options Dropdown Custom UI
    let optionsHtml = `<select id="qualitySelect" class="w-full bg-slate-100 dark:bg-slate-950/80 text-slate-900 dark:text-white text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer">`;
    data.downloadOptions.forEach((opt, i) => {
        optionsHtml += `<option value="${opt.url}">${opt.label}</option>`;
    });
    optionsHtml += `</select>`;
    resolutionSelectorContainer.innerHTML = optionsHtml;
}

// ==========================================
// 6. DOWNLOAD & BATAL UNDUH LOGIC
// ==========================================
downloadBtn.addEventListener('click', () => {
    const qualitySelect = document.getElementById('qualitySelect');
    const selectedUrl = qualitySelect ? qualitySelect.value : '';

    if (!selectedUrl) {
        showToast("Peringatan", "Pilih resolusi terlebih dahulu.");
        return;
    }

    startMediaDownload(selectedUrl);
});

async function startMediaDownload(targetUrl) {
    // Inisialisasi AbortController Baru
    downloadAbortController = new AbortController();
    const signal = downloadAbortController.signal;

    // Reset Progress UI
    progressBox.classList.remove('hidden');
    downloadBtn.disabled = true;
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    try {
        const response = await fetch(targetUrl, { signal });
        
        if (!response.ok) throw new Error("Gagal mengunduh file.");

        const contentLength = +response.headers.get('Content-Length') || 1000000;
        const reader = response.body.getReader();

        let receivedLength = 0;
        let chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            const percent = Math.min(Math.round((receivedLength / contentLength) * 100), 100);
            progressBar.style.width = `${percent}%`;
            progressPercent.textContent = `${percent}%`;
        }

        // Buat File Blob & Auto Download saat selesai
        const blob = new Blob(chunks);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `KALZGLOBAL_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
        if (err.name === 'AbortError') {
            const t = translations[currentLang] || translations.id;
            showToast(t.toastCancelled, t.toastCancelledMsg);
        } else {
            showToast("Download Gagal", "Terjadi kesalahan saat memproses file.");
        }
    } finally {
        // Reset UI State
        progressBox.classList.add('hidden');
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        downloadAbortController = null;
    }
}

// Listener Tombol Batal
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        if (downloadAbortController) {
            downloadAbortController.abort(); // Membatalkan Fetch Request
        }
    });
}

// Tombol Kembali
backBtn.addEventListener('click', () => {
    if (downloadAbortController) {
        downloadAbortController.abort();
    }
    resultCard.classList.add('hidden');
    inputCard.classList.remove('hidden');
    urlInput.value = '';
});

// ==========================================
// 7. TOAST NOTIFICATION HELPERS
// ==========================================
let toastTimeout = null;

function showToast(title, message) {
    toastTitle.innerText = title;
    toastMessage.innerText = message;

    toast.classList.remove('pointer-events-none', '-translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('pointer-events-none', '-translate-y-20', 'opacity-0');
}

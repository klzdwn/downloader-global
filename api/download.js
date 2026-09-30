// File: api/download.js (Vercel Serverless Function)

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ text: 'URL wajib diisi' });
  }

  try {
    // 1. Khusus TikTok (Fast TikWM Engine)
    if (url.includes('tiktok.com') || url.includes('douyin.com')) {
      const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const tikData = await tikRes.json();
      if (tikData.code === 0 && tikData.data) {
        return res.status(200).json({
          url: tikData.data.play,
          thumb: tikData.data.cover,
          text: tikData.data.title || "TikTok Media"
        });
      }
    }

    // 2. Universal Engine (Instagram, YouTube, Twitter/X, FB, Pinterest, dll)
    const apiRes = await fetch(`https://api.vkrdown.com/fetch/?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const data = await apiRes.json();

    if (data && data.data) {
      let downloadUrl = "";
      let thumbUrl = data.thumbnail || data.cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80";

      if (Array.isArray(data.data) && data.data.length > 0) {
        downloadUrl = data.data[0].url;
      } else if (typeof data.data === 'object' && data.data.url) {
        downloadUrl = data.data.url;
      } else if (typeof data.data === 'string') {
        downloadUrl = data.data;
      }

      if (downloadUrl) {
        return res.status(200).json({
          url: downloadUrl,
          thumb: thumbUrl,
          text: data.title || "Media Download"
        });
      }
    }

    // 3. Emergency Fallback Proxy
    const fallbackRes = await fetch(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`);
    const fallbackData = await fallbackRes.json();

    if (fallbackData && fallbackData.data && fallbackData.data.length > 0) {
      return res.status(200).json({
        url: fallbackData.data[0].url,
        thumb: fallbackData.data[0].thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
        text: "Instagram Media"
      });
    }

    return res.status(400).json({ text: "Gagal mengambil media. Pastikan tautan publik." });

  } catch (error) {
    console.error('Server Backend Error:', error);
    return res.status(200).json({ text: "Gagal memproses media dari server, coba tautan lain." });
  }
}

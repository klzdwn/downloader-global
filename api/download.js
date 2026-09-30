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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. Coba dengan Cobalt v10 API (Format & Endpoint Terbaru)
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        url: url,
        videoQuality: 'max'
      })
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      if (data && (data.url || data.picker)) {
        return res.status(200).json(data);
      }
    }

    // 2. Fallback: Jika TikTok, gunakan TikWM API
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

    // 3. Fallback: Universal AIO Scraper Proxy
    const fallbackRes = await fetch(`https://api.vkrdown.com/fetch/?url=${encodeURIComponent(url)}`);
    const fallbackData = await fallbackRes.json();

    if (fallbackData && fallbackData.data) {
      const downloadUrl = Array.isArray(fallbackData.data) ? fallbackData.data[0].url : fallbackData.data.url;
      return res.status(200).json({
        url: downloadUrl,
        thumb: fallbackData.thumbnail || fallbackData.cover,
        text: fallbackData.title || "Media Download"
      });
    }

    return res.status(400).json({ text: "Gagal memproses media. Pastikan tautan publik." });

  } catch (error) {
    console.error('Vercel Backend Error:', error);
    return res.status(500).json({ text: "Terjadi kesalahan pada server backend.", details: error.message });
  }
}

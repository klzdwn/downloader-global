// File: api/download.js (Vercel Serverless Function using Scraper Logic)
import axios from 'axios';
import * as cheerio from 'cheerio';

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
    // 1. TikTok Scraper
    if (url.includes('tiktok.com') || url.includes('douyin.com')) {
      const response = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url: url }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      });
      if (response.data && response.data.code === 0) {
        return res.status(200).json({
          url: response.data.data.play,
          thumb: response.data.data.cover,
          text: response.data.data.title || "TikTok Video"
        });
      }
    }

    // 2. Instagram Scraper (Direct Parse via SnapInsta Scraper Endpoint)
    if (url.includes('instagram.com')) {
      const igRes = await axios.post('https://snapinsta.app/action2.php', new URLSearchParams({
        url: url,
        action: 'post'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(igRes.data);
      const downloadUrl = $('.download-bottom a').attr('href') \vert{}\vert{}$('a.btn-download').attr('href');
      const thumbUrl = $('.media-box img').attr('src');

      if (downloadUrl) {
        return res.status(200).json({
          url: downloadUrl,
          thumb: thumbUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
          text: "Instagram Media"
        });
      }
    }

    // 3. Universal Fallback Scraper (YouTube, Twitter, Facebook, Pinterest)
    const uniRes = await axios.get(`https://api.vkrdown.com/fetch/?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (uniRes.data && uniRes.data.data) {
      let mediaData = uniRes.data.data;
      let downloadUrl = Array.isArray(mediaData) ? mediaData[0].url : (mediaData.url || mediaData);
      
      if (downloadUrl) {
        return res.status(200).json({
          url: downloadUrl,
          thumb: uniRes.data.thumbnail || uniRes.data.cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
          text: uniRes.data.title || "Media Download"
        });
      }
    }

    return res.status(400).json({ text: "Gagal mengekstrak media. Pastikan tautan bersifat publik." });

  } catch (error) {
    console.error('Scraper Error:', error.message);
    return res.status(200).json({ text: "Terjadi kesalahan saat mengekstrak media dari URL tersebut." });
  }
}

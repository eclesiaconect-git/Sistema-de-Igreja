export function youtubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const u = new URL(url);

    // youtu.be/VIDEO_ID
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
    }

    const partes = u.pathname.split('/').filter(Boolean);

    // youtube.com/live/VIDEO_ID  ou  youtube.com/embed/VIDEO_ID
    if (partes[0] === 'live' || partes[0] === 'embed') {
      return partes[1] ? `https://www.youtube.com/embed/${partes[1]}` : null;
    }

    // youtube.com/channel/CHANNEL_ID/live -> sempre mostra o que estiver ao vivo agora
    if (partes[0] === 'channel' && partes[1] && partes[2] === 'live') {
      return `https://www.youtube.com/embed/live_stream?channel=${partes[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

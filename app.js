// 공통 유틸: Supabase 클라이언트, 이미지 압축, 날짜 포맷
(function () {
  if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || window.CONFIG.SUPABASE_URL.includes('YOUR-PROJECT')) {
    document.addEventListener('DOMContentLoaded', function () {
      const warn = document.createElement('div');
      warn.style.cssText = 'background:#fee;border:1px solid #f99;color:#900;padding:12px;margin:12px;border-radius:8px;font-size:14px';
      warn.innerHTML = 'config.js 가 설정되지 않았습니다. <code>config.example.js</code> 를 <code>config.js</code> 로 복사하고 Supabase URL/anon key 를 입력해주세요.';
      document.body.prepend(warn);
    });
    return;
  }

  const sb = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);

  // 이미지 압축: 긴 변 maxSide(px), JPEG quality
  async function compressImage(file, maxSide = 1280, quality = 0.82) {
    if (!file.type.startsWith('image/')) return file;
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = dataUrl;
    });
    const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
    return new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'photo') + '.jpg', { type: 'image/jpeg' });
  }

  function todayISO() {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function publicUrl(path) {
    return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }

  async function getDefaultChecklist() {
    const { data, error } = await sb.from('settings').select('default_checklist').eq('id', 1).single();
    if (error) throw error;
    return data.default_checklist || [];
  }

  async function saveDefaultChecklist(items) {
    const { error } = await sb.from('settings').update({ default_checklist: items, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) throw error;
  }

  async function getExtraRequest(date) {
    const { data, error } = await sb.from('extra_requests').select('items').eq('request_date', date).maybeSingle();
    if (error) throw error;
    return data ? data.items : [];
  }

  async function saveExtraRequest(date, items) {
    const { error } = await sb.from('extra_requests').upsert({ request_date: date, items }, { onConflict: 'request_date' });
    if (error) throw error;
  }

  async function getUploadsByDate(date) {
    const { data, error } = await sb
      .from('uploads')
      .select('*')
      .eq('upload_date', date)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function getDistinctDates(limit = 60) {
    const { data, error } = await sb
      .from('uploads')
      .select('upload_date')
      .order('upload_date', { ascending: false })
      .limit(2000);
    if (error) throw error;
    const seen = new Set();
    const out = [];
    for (const row of data || []) {
      if (!seen.has(row.upload_date)) {
        seen.add(row.upload_date);
        out.push(row.upload_date);
        if (out.length >= limit) break;
      }
    }
    return out;
  }

  async function uploadPhoto({ file, itemLabel, isExtra, note }) {
    const compressed = await compressImage(file);
    const date = todayISO();
    const ext = 'jpg';
    const rand = Math.random().toString(36).slice(2, 10);
    const path = `${date}/${Date.now()}_${rand}.${ext}`;
    const { error: upErr } = await sb.storage.from('photos').upload(path, compressed, {
      contentType: 'image/jpeg',
      upsert: false
    });
    if (upErr) throw upErr;
    const { error: insErr } = await sb.from('uploads').insert({
      upload_date: date,
      item_label: itemLabel,
      is_extra: !!isExtra,
      photo_path: path,
      note: note || null
    });
    if (insErr) throw insErr;
  }

  window.App = {
    sb,
    compressImage,
    todayISO,
    formatDate,
    formatTime,
    publicUrl,
    getDefaultChecklist,
    saveDefaultChecklist,
    getExtraRequest,
    saveExtraRequest,
    getUploadsByDate,
    getDistinctDates,
    uploadPhoto
  };
})();

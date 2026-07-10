// ============================================
// SPRAYBOX SEPET MANTIĞI (localStorage tabanlı, üyelik gerektirmez)
// ============================================
const SEPET_KEY = 'spraybox_sepet';

function sepetiGetir() {
  try { return JSON.parse(localStorage.getItem(SEPET_KEY)) || []; }
  catch { return []; }
}

function sepetiKaydet(sepet) {
  localStorage.setItem(SEPET_KEY, JSON.stringify(sepet));
  sepetRozetiGuncelle();
}

function sepeteEkle(urun, miktar) {
  miktar = miktar || 1;
  const sepet = sepetiGetir();
  const stokLimiti = (urun.stok === undefined || urun.stok === null || isNaN(urun.stok)) ? Infinity : urun.stok;

  if (stokLimiti <= 0) {
    sepetBildirimGoster(urun.ad + ' stokta yok', true);
    return;
  }

  const mevcut = sepet.find(x => x.id === urun.id);
  const mevcutAdet = mevcut ? mevcut.adet : 0;
  const eklenebilir = Math.min(miktar, stokLimiti - mevcutAdet);

  if (eklenebilir <= 0) {
    sepetBildirimGoster('Stok limitine ulaştın (' + stokLimiti + ' adet)', true);
    return;
  }

  if (mevcut) {
    mevcut.adet += eklenebilir;
  } else {
    sepet.push({
      id: urun.id,
      ad: urun.ad,
      fiyat: urun.fiyat,
      resim_url: urun.resim_url || '',
      kategori: urun.kategori || '',
      stok: stokLimiti,
      adet: eklenebilir
    });
  }
  sepetiKaydet(sepet);

  if (eklenebilir < miktar) {
    sepetBildirimGoster(urun.ad + ' için en fazla ' + stokLimiti + ' adet eklendi', true);
  } else {
    sepetBildirimGoster(urun.ad + ' sepete eklendi');
  }
}

function sepettenCikar(id) {
  const sepet = sepetiGetir().filter(x => x.id !== id);
  sepetiKaydet(sepet);
}

function sepetAdetGuncelle(id, yeniAdet) {
  let sepet = sepetiGetir();
  const item = sepet.find(x => x.id === id);
  if (!item) return;
  const stokLimiti = (item.stok === undefined || item.stok === null) ? Infinity : item.stok;
  if (yeniAdet <= 0) {
    sepet = sepet.filter(x => x.id !== id);
  } else if (yeniAdet > stokLimiti) {
    sepetBildirimGoster('Stok limitine ulaştın (' + stokLimiti + ' adet)', true);
    return;
  } else {
    item.adet = yeniAdet;
  }
  sepetiKaydet(sepet);
}

function sepetiBosalt() {
  localStorage.removeItem(SEPET_KEY);
  sepetRozetiGuncelle();
}

function sepetToplamAdet() {
  return sepetiGetir().reduce((t, x) => t + x.adet, 0);
}

function sepetToplamTutar() {
  return sepetiGetir().reduce((t, x) => t + (x.adet * x.fiyat), 0);
}

function sepetRozetiGuncelle() {
  const adet = sepetToplamAdet();
  document.querySelectorAll('.cart-badge').forEach(el => el.textContent = adet);
}

function sepetIkonuAnimasyonYap() {
  document.querySelectorAll('a[aria-label="Sepetim"], .icon-btn[aria-label="Sepetim"]').forEach(el => {
    el.classList.remove('sepet-zipla');
    void el.offsetWidth; // animasyonu sıfırdan tetiklemek için
    el.classList.add('sepet-zipla');
  });
}

function sepetBildirimGoster(mesaj, hataMi) {
  if (!document.getElementById('sepet-bildirim-style')) {
    const style = document.createElement('style');
    style.id = 'sepet-bildirim-style';
    style.textContent = `
      @keyframes sepetZipla { 0%{transform:scale(1);} 30%{transform:scale(1.25);} 60%{transform:scale(0.95);} 100%{transform:scale(1);} }
      .sepet-zipla { animation: sepetZipla 0.4s ease; }
      @keyframes sepetBildirimGir { from{opacity:0; transform:translate(-50%,-8px);} to{opacity:1; transform:translate(-50%,0);} }
    `;
    document.head.appendChild(style);
  }

  let el = document.getElementById('sepet-bildirim');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sepet-bildirim';
    el.style.cssText = 'position:fixed;top:14px;left:50%;color:#fff;padding:12px 22px;border-radius:8px;font-size:14px;font-family:Inter,sans-serif;z-index:400;box-shadow:0 4px 14px rgba(0,0,0,0.25);opacity:0;max-width:280px;text-align:center;display:flex;align-items:center;gap:8px;';
    document.body.appendChild(el);
  }
  el.style.background = hataMi ? '#D31E25' : '#14294B';
  const ikon = hataMi ? 'fa-triangle-exclamation' : 'fa-circle-check';
  const ikonRenk = hataMi ? '#fff' : '#5FD98A';
  el.innerHTML = `<i class="fa-solid ${ikon}" style="color:${ikonRenk};"></i> ${mesaj}`;
  el.style.animation = 'sepetBildirimGir 0.25s ease forwards';
  el.style.opacity = '1';
  clearTimeout(window._sepetBildirimTimeout);
  window._sepetBildirimTimeout = setTimeout(() => { el.style.opacity = '0'; }, 2000);

  if (!hataMi) sepetIkonuAnimasyonYap();
}

document.addEventListener('DOMContentLoaded', sepetRozetiGuncelle);

// ============================================
// SPRAYBOX ÜYELİK / OTURUM MANTIĞI
// ============================================
const MUSTERI_KEY = 'spraybox_musteri';

function musteriGetir() {
  try { return JSON.parse(localStorage.getItem(MUSTERI_KEY)); }
  catch { return null; }
}

function musteriGirisYap(musteri) {
  localStorage.setItem(MUSTERI_KEY, JSON.stringify(musteri));
  authAlaniniGuncelle();
}

function musteriCikisYap() {
  localStorage.removeItem(MUSTERI_KEY);
  window.location.href = 'index.html';
}

async function sha256Hesapla(metin) {
  const veri = new TextEncoder().encode(metin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', veri);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function authAlaniniGuncelle() {
  const musteri = musteriGetir();
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  const kayitBtn = headerActions.querySelector('a.btn-outline');
  const girisBtn = headerActions.querySelector('a.btn-primary');
  if (!kayitBtn || !girisBtn) return;

  if (musteri) {
    kayitBtn.style.display = 'none';
    girisBtn.innerHTML = '<i class="fa-solid fa-user"></i> ' + musteri.ad_soyad.split(' ')[0];
    girisBtn.href = 'hesabim.html';
  } else {
    kayitBtn.style.display = '';
    kayitBtn.href = 'kayit.html';
    girisBtn.innerHTML = 'Giriş Yap';
    girisBtn.href = 'giris.html';
  }
}

document.addEventListener('DOMContentLoaded', authAlaniniGuncelle);

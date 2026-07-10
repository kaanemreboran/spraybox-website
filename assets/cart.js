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

function sepeteEkle(urun) {
  const sepet = sepetiGetir();
  const mevcut = sepet.find(x => x.id === urun.id);
  if (mevcut) {
    mevcut.adet += 1;
  } else {
    sepet.push({
      id: urun.id,
      ad: urun.ad,
      fiyat: urun.fiyat,
      resim_url: urun.resim_url || '',
      kategori: urun.kategori || '',
      adet: 1
    });
  }
  sepetiKaydet(sepet);
  sepetBildirimGoster(urun.ad);
}

function sepettenCikar(id) {
  const sepet = sepetiGetir().filter(x => x.id !== id);
  sepetiKaydet(sepet);
}

function sepetAdetGuncelle(id, yeniAdet) {
  let sepet = sepetiGetir();
  const item = sepet.find(x => x.id === id);
  if (!item) return;
  if (yeniAdet <= 0) {
    sepet = sepet.filter(x => x.id !== id);
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

function sepetBildirimGoster(ad) {
  let el = document.getElementById('sepet-bildirim');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sepet-bildirim';
    el.style.cssText = 'position:fixed;bottom:90px;right:22px;background:#14294B;color:#fff;padding:13px 20px;border-radius:8px;font-size:14px;font-family:Inter,sans-serif;z-index:300;box-shadow:0 4px 14px rgba(0,0,0,0.25);opacity:0;transition:opacity .2s;max-width:260px;';
    document.body.appendChild(el);
  }
  el.textContent = ad + ' sepete eklendi';
  el.style.opacity = '1';
  clearTimeout(window._sepetBildirimTimeout);
  window._sepetBildirimTimeout = setTimeout(() => { el.style.opacity = '0'; }, 1800);
}

document.addEventListener('DOMContentLoaded', sepetRozetiGuncelle);

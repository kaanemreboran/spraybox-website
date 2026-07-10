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

function sepetIkonuAnimasyonYap() {
  document.querySelectorAll('a[aria-label="Sepetim"], .icon-btn[aria-label="Sepetim"]').forEach(el => {
    el.classList.remove('sepet-zipla');
    void el.offsetWidth; // animasyonu sıfırdan tetiklemek için
    el.classList.add('sepet-zipla');
  });
}

function sepetBildirimGoster(ad) {
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
    el.style.cssText = 'position:fixed;top:14px;left:50%;background:#14294B;color:#fff;padding:12px 22px;border-radius:8px;font-size:14px;font-family:Inter,sans-serif;z-index:400;box-shadow:0 4px 14px rgba(0,0,0,0.25);opacity:0;max-width:280px;text-align:center;display:flex;align-items:center;gap:8px;';
    document.body.appendChild(el);
  }
  el.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#5FD98A;"></i> ' + ad + ' sepete eklendi';
  el.style.animation = 'sepetBildirimGir 0.25s ease forwards';
  el.style.opacity = '1';
  clearTimeout(window._sepetBildirimTimeout);
  window._sepetBildirimTimeout = setTimeout(() => { el.style.opacity = '0'; }, 1800);

  sepetIkonuAnimasyonYap();
}

document.addEventListener('DOMContentLoaded', sepetRozetiGuncelle);

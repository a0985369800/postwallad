const apiUrl = "https://script.google.com/macros/s/AKfycbwiAeNHdYL2GfI0BcOhOt6iBbkitpQAycK7rhVI5svRVTNKQjfzs4-1vrki-q2fdMklRA/exec";

// ════════════════════════════════
// SEO 動態注入（從 Google Sheets SEO 工作表）
// ════════════════════════════════
(function initSeo() {
  const page = location.pathname.split('/').pop() || 'index.html';
  jsonp('seo', function(rows) {
    if (!rows || rows.length === 0) return;
    const row = rows.find(r => (r['頁面'] || '').trim() === page);
    if (!row) return;

    const title    = (row['標題title']     || '').trim();
    const desc     = (row['meta描述(og)']  || '').trim();
    const keywords = (row['meta關鍵字(og)']|| '').trim();
    const ogImg    = (row['og圖片網址']    || '').trim();

    if (title) {
      document.title = title;
      setMeta('property', 'og:title',       title);
      setMeta('name',     'twitter:title',  title);
    }
    if (desc) {
      setMeta('name',     'description',          desc);
      setMeta('property', 'og:description',       desc);
      setMeta('name',     'twitter:description',  desc);
    }
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }
    if (ogImg) {
      setMeta('property', 'og:image',      ogImg);
      setMeta('name',     'twitter:image', ogImg);
    }
  });

  function setMeta(attr, val, content) {
    let el = document.querySelector(`meta[${attr}="${val}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, val);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
})();

// ════════════════════════════════
// 工具函式
// ════════════════════════════════
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// JSONP 通用載入器（Apps Script 不支援 CORS，統一用 JSONP）
function jsonp(action, callbackFn) {
  const callbackName = '_cb_' + action + '_' + Date.now();
  const script = document.createElement('script');

  // 逾時保護：8 秒後自動觸發空資料
  const timer = setTimeout(() => {
    window[callbackName] = null;
    script.remove();
    callbackFn([]);
  }, 8000);

  window[callbackName] = function(data) {
    clearTimeout(timer);
    window[callbackName] = null;
    script.remove();
    callbackFn(data);
  };

  script.src = `${apiUrl}?action=${action}&callback=${callbackName}`;
  script.onerror = function() {
    clearTimeout(timer);
    window[callbackName] = null;
    script.remove();
    callbackFn([]);
  };
  document.body.appendChild(script);
}

// ════════════════════════════════
// 首頁：輪播圖
// ════════════════════════════════
if (document.getElementById('heroCarousel')) {
  jsonp('carousel', buildCarousel);
}

function buildCarousel(slides) {
  const indicators = document.getElementById('carouselIndicators');
  const inner      = document.getElementById('carouselInner');
  const loading    = document.getElementById('carouselLoading');
  const carouselEl = document.getElementById('heroCarousel');

  // 過濾掉無效資料（空白、#N/A）
  const valid = (val) => val && String(val).trim() !== '' && String(val).trim() !== '#N/A';

  if (slides && slides.length > 0) {
    slides = slides.filter(s => valid(s.imageUrl) || valid(s.slogan));
  }

  // 備用投影片（直接用 Google Drive lh3 圖片網址）
  if (!slides || slides.length === 0) {
    slides = [
      {
        slogan: '深耕基隆核心商圈，精準掌握港灣人氣商機。',
        cta: '立即搶佔吸睛版面',
        imageUrl: 'https://lh3.googleusercontent.com/d/1tQPrkdO7iBKEMai3gN35b9tbhWOrn4ae'
      },
      {
        slogan: '用您的繽紛廣告，溫暖基隆港灣的每一個在地日子。',
        cta: '立即諮詢優惠方案',
        imageUrl: 'https://lh3.googleusercontent.com/d/1dhsEes9yQCedRduuTqDXcPPL-7EVPghx'
      },
      {
        slogan: '與彩虹層並肩，讓您的品牌成為下一個打卡熱點！',
        cta: '聯繫在地招商專員',
        imageUrl: 'https://lh3.googleusercontent.com/d/1g07Ve74yG3DwvrBlzAdHOP-_JyJbY1D7'
      }
    ];
  }

  slides.forEach((slide, i) => {
    // Indicator 點點
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.bsTarget = '#heroCarousel';
    btn.dataset.bsSlideTo = String(i);
    btn.setAttribute('aria-label', `第 ${i + 1} 張`);
    if (i === 0) { btn.classList.add('active'); btn.setAttribute('aria-current', 'true'); }
    indicators.appendChild(btn);

    // 投影片
    const item = document.createElement('div');
    item.className = 'carousel-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `
      <img src="${escHtml(valid(slide.imageUrl) ? slide.imageUrl : 'banner_1.png')}"
           class="d-block w-100 carousel-hero-img"
           alt="${escHtml(slide.slogan || '')}"
           loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="carousel-caption carousel-hero-caption d-flex flex-column align-items-center justify-content-center">
        <h1 class="display-4 fw-bold lh-sm mb-3 carousel-hero-title">${escHtml(slide.slogan || '')}</h1>
        <a href="locations.html" class="btn btn-danger btn-lg px-5 fw-bold shadow" role="button">
          <i class="fa-solid fa-circle-arrow-right me-2" aria-hidden="true"></i>${escHtml(slide.cta || '瀏覽版位')}
        </a>
      </div>`;
    inner.appendChild(item);
  });

  loading.classList.add('d-none');
  carouselEl.classList.remove('d-none');

  // 動態加入投影片後，手動初始化 Bootstrap Carousel
  new bootstrap.Carousel(carouselEl, {
    interval: 5000,
    ride: 'carousel',
    wrap: true
  });
}

// ════════════════════════════════
// locations.html：局所列表
// ════════════════════════════════
(function initLocations() {
  if (!document.getElementById('locationsGrid')) return;

  // 同時撈 locations + spaces（用來計算可用版位數）
  let locData = null, spaceData = null;

  jsonp('locations', function(data) {
    console.log('locations 收到', data ? data.length : 0, '筆');
    locData = data;
    // locations 一到就先渲染，不等 spaces
    renderLocations(locData, spaceData || []);
  });

  jsonp('spaces', function(data) {
    console.log('spaces 收到', data ? data.length : 0, '筆');
    spaceData = data;
    // spaces 到了再重新渲染（更新可用版位數）
    if (locData !== null) renderLocations(locData, spaceData);
  });
})();

// 全域存放，供篩選器使用
let _allLocations = [];
let _allSpaces    = [];

function renderLocations(locations, spaces) {
  _allLocations = locations || [];
  _allSpaces    = spaces    || [];

  document.getElementById('loadingState').classList.add('d-none');

  if (_allLocations.length === 0) {
    // 區分「API 未部署」vs「真的沒資料」
    document.getElementById('errorState').innerHTML =
      '<i class="fa-solid fa-triangle-exclamation me-2"></i>' +
      '資料載入失敗。請確認 Apps Script 已重新部署，並開放「任何人」存取。';
    document.getElementById('errorState').classList.remove('d-none');
    return;
  }

  // 動態填入縣市選項（從資料取得，避免硬碼對不上）
  const cities = [...new Set(_allLocations.map(l => (l['縣市'] || '').trim()).filter(Boolean))].sort();
  const cityEl = document.getElementById('cityFilter');
  // 清除舊選項（保留第一個「全部縣市」），避免重複渲染時疊加
  while (cityEl.options.length > 1) cityEl.remove(1);
  cities.forEach(c => cityEl.appendChild(new Option(c, c)));

  // 初始化行政區下拉（依縣市）
  initDistrictFilter();

  // 綁定篩選事件
  document.getElementById('cityFilter').addEventListener('change', function() {
    updateDistrictFilter(this.value);
    applyFilter();
  });
  document.getElementById('districtFilter').addEventListener('change', applyFilter);
  document.getElementById('searchInput').addEventListener('input', applyFilter);
  document.getElementById('availableOnly').addEventListener('change', applyFilter);

  applyFilter();
}

function initDistrictFilter() {
  // 預建所有行政區對應關係
  window._districtMap = {};
  _allLocations.forEach(loc => {
    const city = (loc['縣市'] || '').trim();
    const dist = (loc['行政區'] || '').trim();
    if (!city || !dist) return;
    if (!window._districtMap[city]) window._districtMap[city] = new Set();
    window._districtMap[city].add(dist);
  });
}

function updateDistrictFilter(city) {
  const sel = document.getElementById('districtFilter');
  sel.innerHTML = '<option value="">全部行政區</option>';
  if (city && window._districtMap && window._districtMap[city]) {
    [...window._districtMap[city]].sort().forEach(d => {
      sel.appendChild(new Option(d, d));
    });
  }
}

function applyFilter() {
  const city      = document.getElementById('cityFilter').value;
  const district  = document.getElementById('districtFilter').value;
  const search    = document.getElementById('searchInput').value.trim().toLowerCase();
  const availOnly = document.getElementById('availableOnly').checked;

  const filtered = _allLocations.filter(loc => {
    if (city     && (loc['縣市']   || '').trim() !== city)     return false;
    if (district && (loc['行政區'] || '').trim() !== district)  return false;
    if (search) {
      const name = (loc['局名']  || '').toLowerCase();
      const addr = (loc['地址']  || '').toLowerCase();
      if (!name.includes(search) && !addr.includes(search)) return false;
    }
    if (availOnly) {
      const hasAvail = _allSpaces.some(
        s => s['location_id'] === loc['location_id'] && isAvailable(s)
      );
      if (!hasAvail) return false;
    }
    return true;
  });

  document.getElementById('resultCount').textContent = `共 ${filtered.length} 間`;
  renderGrid(filtered);
}

function renderGrid(locations) {
  const grid  = document.getElementById('locationsGrid');
  const empty = document.getElementById('emptyState');

  if (locations.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  grid.innerHTML = locations.map(loc => {
    const imgUrl    = validUrl(loc['File ID圖片網址']) || validUrl(loc['封面圖網址']) || '';
    const spaces    = _allSpaces.filter(s => s['location_id'] === loc['location_id']);
    const availCnt  = spaces.filter(s => isAvailable(s)).length;

    const spaceUrl = `spaces.html?id=${encodeURIComponent(loc['location_id'] || '')}`;
    const imgEl = imgUrl
      ? `<img src="${escHtml(imgUrl)}" class="card-img-top" alt="${escHtml(loc['局名'] || '')}"
              style="height:200px;object-fit:cover${availCnt > 0 ? ';cursor:pointer' : ''}" loading="lazy">`
      : `<div class="bg-light d-flex align-items-center justify-content-center text-muted"
              style="height:200px"><i class="fa-solid fa-building fs-1"></i></div>`;
    return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm border-0">
          ${availCnt > 0 ? `<a href="${spaceUrl}">${imgEl}</a>` : imgEl}
          <div class="card-body p-2">
            <div class="fw-semibold small">${escHtml(loc['局名'] || '')}</div>
            <div class="text-muted" style="font-size:11px">${escHtml((loc['縣市'] || '').trim())} ${escHtml((loc['行政區'] || '').trim())}</div>
            <div class="text-muted text-truncate" style="font-size:11px">${escHtml(loc['地址'] || '')}</div>
          </div>
          <div class="card-footer p-2 d-flex justify-content-between align-items-center">
            <span class="badge ${availCnt > 0 ? 'bg-success' : 'bg-secondary'}" style="font-size:10px">
              ${availCnt > 0 ? '有' + availCnt + '處可刊登' : '無可刊登版位'}
            </span>
            ${availCnt > 0 ? `<a href="${spaceUrl}" class="btn btn-danger btn-sm py-0 px-2" style="font-size:12px">看版位</a>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}

// 動態找「狀態」欄位，不受欄位名稱打字差異影響
function isAvailable(space) {
  const statusKey = Object.keys(space).find(k => k.includes('狀態'));
  if (!statusKey) return true; // 找不到欄位時預設可用
  return space[statusKey] === '可刊登';
}

// ════════════════════════════════
// spaces.html：版位詳細頁
// ════════════════════════════════
(function initSpaces() {
  if (!document.getElementById('spacesPage')) return;

  const params     = new URLSearchParams(window.location.search);
  const locationId = params.get('id') || '';

  if (!locationId) {
    showSpacesError('缺少局所參數，請從<a href="locations.html" class="alert-link">局所列表</a>進入。');
    return;
  }

  let _location  = null;
  let _spaces    = [];
  let _locLoaded = false;
  let _spcLoaded = false;
  const _cart    = []; // [{idx, space, months, total}]

  jsonp('locations', function(data) {
    _location  = (data || []).find(l => l['location_id'] === locationId) || null;
    _locLoaded = true;
    tryRender();
  });

  jsonp('spaces', function(data) {
    _spaces    = (data || []).filter(s => s['location_id'] === locationId && isAvailable(s));
    _spcLoaded = true;
    tryRender();
  });

  function tryRender() {
    if (!_locLoaded || !_spcLoaded) return;
    document.getElementById('spacesLoading').classList.add('d-none');
    if (!_location) {
      showSpacesError('找不到此局所資料，請返回<a href="locations.html" class="alert-link">局所列表</a>。');
      return;
    }
    renderLocationHeader();
    renderSpacesList();
  }

  function renderLocationHeader() {
    const loc      = _location;
    const city     = (loc['縣市']   || '').trim();
    const district = (loc['行政區'] || '').trim();
    const addr     = (loc['地址']   || '').trim();
    const fullAddr = city + district + addr;
    const mapSrc   = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddr)}&output=embed&hl=zh-TW`;

    document.getElementById('locationHeader').innerHTML = `
      <nav aria-label="breadcrumb" class="mt-3">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item">
            <a href="locations.html" class="text-success text-decoration-none">局所列表</a>
          </li>
          <li class="breadcrumb-item active">${escHtml(loc['局名'] || '')}</li>
        </ol>
      </nav>
      <div class="bg-white rounded shadow-sm p-3 mb-3">
        <div class="row g-3">
          <div class="col-md-6">
            <h1 class="h5 fw-bold mb-2">
              <i class="fa-solid fa-building text-success me-2"></i>${escHtml(loc['局名'] || '')}
            </h1>
            <p class="text-muted small mb-1">
              <i class="fa-solid fa-location-dot me-1"></i>${escHtml(fullAddr)}
            </p>
            ${loc['電話號碼'] ? `<p class="text-muted small mb-0"><i class="fa-solid fa-phone me-1"></i>${escHtml(String(loc['電話號碼']))}</p>` : ''}
          </div>
          <div class="col-md-6">
            <iframe src="${escHtml(mapSrc)}"
              width="100%" height="220"
              style="border:0;border-radius:8px;display:block"
              allowfullscreen loading="lazy"
              title="${escHtml(loc['局名'] || '')} 地圖位置"></iframe>
          </div>
        </div>
      </div>`;
    document.getElementById('locationHeader').classList.remove('d-none');
  }

  function renderSpacesList() {
    const el = document.getElementById('spacesList');

    if (_spaces.length === 0) {
      el.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-circle-info text-muted" style="font-size:3rem"></i>
          <p class="mt-3 text-muted">此局所目前無可刊登版位</p>
          <a href="locations.html" class="btn btn-outline-success btn-sm">返回局所列表</a>
        </div>`;
      el.classList.remove('d-none');
      return;
    }

    const cardsHtml = _spaces.map((space, idx) => {
      const sid    = escHtml(space['space_id'] || `版位 ${idx + 1}`);
      const w      = escHtml(String(space['寬cm.'] || '-'));
      const h      = escHtml(String(space['高cm']  || '-'));
      const imgUrl = validUrl(space['File ID圖片網址']);
      const price0 = calcSpaceTotal(space, 1);

      return `
        <div class="card mb-3 shadow-sm border-0" id="spaceCard_${idx}">
          <div class="card-body p-3">
            <div class="row g-3 align-items-center">
              ${imgUrl ? `
              <div class="col-4 col-sm-3 col-md-2">
                <img src="${escHtml(imgUrl)}" alt="${sid}"
                     class="rounded w-100" style="height:90px;object-fit:cover;cursor:zoom-in"
                     onclick="openImgModal('${escHtml(imgUrl)}','${sid}')">
              </div>` : ''}
              <div class="col col-sm col-md">
                <div class="fw-bold text-success small">${sid}</div>
                <div class="text-muted" style="font-size:12px">尺寸：${w} × ${h} cm</div>
              </div>
              <div class="col-12 col-sm-auto">
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0 small text-nowrap fw-semibold" for="months_${idx}">刊登月份</label>
                  <input type="number" class="form-control form-control-sm text-center" id="months_${idx}"
                         min="1" value="1" style="width:68px"
                         oninput="updateSpacePrice(${idx})">
                  <span class="small text-muted">個月</span>
                </div>
              </div>
              <div class="col-12 col-sm-auto text-sm-end">
                <div class="fw-bold text-danger" id="price_${idx}">NT$ ${formatPrice(price0)}</div>
                <div class="text-muted" style="font-size:10px">廣告媒體+印刷輸出＋施工與復原等費用</div>
              </div>
              <div class="col-12 col-sm-auto">
                <button class="btn btn-danger btn-sm w-100" id="cartBtn_${idx}"
                        onclick="addToInquiry(${idx})">
                  <i class="fa-solid fa-circle-plus me-1"></i>加入詢價
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h6 fw-bold mb-0">
          <i class="fa-solid fa-grip me-2 text-success"></i>可刊登版位（共 ${_spaces.length} 處）
        </h2>
      </div>
      ${cardsHtml}`;
    el.classList.remove('d-none');
  }

  function calcSpaceTotal(space, months) {
    const keys = Object.keys(space);
    // I欄：出租報價/月（唯一乘月數）
    const rentKey   = keys.find(k => k.includes('出租報價') && k.includes('月'));
    // O欄：印刷輸出報價（固定）
    const printKey  = keys.find(k => k.includes('印刷輸出報價'));
    // Q欄：吊車費用（固定）
    const feeKey    = keys.find(k => k.includes('吊車費'));
    // S欄：施工報價（固定）
    const priceKey  = keys.find(k => k.includes('施工報價'));

    const rent    = rentKey   ? parseNum(space[rentKey])   : 0;
    const print   = printKey  ? parseNum(space[printKey])  : 0;
    const fee     = feeKey    ? parseNum(space[feeKey])    : 0;
    const price   = priceKey  ? parseNum(space[priceKey])  : 0;

    return rent * months + print + fee + price;
  }

  window.updateSpacePrice = function(idx) {
    const months = Math.max(1, parseInt(document.getElementById(`months_${idx}`).value) || 1);
    document.getElementById(`price_${idx}`).textContent = `NT$ ${formatPrice(calcSpaceTotal(_spaces[idx], months))}`;
  };

  window.addToInquiry = function(idx) {
    const btn      = document.getElementById(`cartBtn_${idx}`);
    const existing = _cart.findIndex(c => c.idx === idx);

    if (existing >= 0) {
      // 已在清單 → 移除（toggle off）
      _cart.splice(existing, 1);
      btn.innerHTML = '<i class="fa-solid fa-circle-plus me-1"></i>加入詢價';
      btn.classList.replace('btn-success', 'btn-danger');
    } else {
      // 加入清單
      const months = Math.max(1, parseInt(document.getElementById(`months_${idx}`).value) || 1);
      const space  = _spaces[idx];
      const total  = calcSpaceTotal(space, months);
      _cart.push({ idx, space, months, total });
      btn.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i>已加入詢價';
      btn.classList.replace('btn-danger', 'btn-success');
    }

    document.getElementById('inquiryCount').textContent = _cart.length;
    if (_cart.length > 0) {
      document.getElementById('inquiryBar').classList.remove('d-none');
      document.body.style.paddingBottom = '52px';
    } else {
      document.getElementById('inquiryBar').classList.add('d-none');
      document.body.style.paddingBottom = '';
    }
  };

  function refreshInquiryModal() {
    const locName = _location ? escHtml(_location['局名'] || '') : '';
    let grandTotal = 0;

    const rows = _cart.map(c => {
      grandTotal += c.total;
      const w = escHtml(String(c.space['寬cm.'] || '-'));
      const h = escHtml(String(c.space['高cm']  || '-'));
      return `
        <tr id="modalRow_${c.idx}">
          <td>${escHtml(c.space['space_id'] || '')}</td>
          <td>${w} × ${h} cm</td>
          <td class="text-center">
            <input type="number" min="1" value="${c.months}"
                   class="form-control form-control-sm text-center d-inline-block"
                   style="width:68px"
                   oninput="updateModalMonths(${c.idx}, this.value)">
          </td>
          <td class="text-end fw-bold text-danger" id="modalPrice_${c.idx}">NT$ ${formatPrice(c.total)}</td>
          <td class="text-center">
            <button class="btn btn-outline-danger btn-sm py-0 px-1" style="font-size:11px"
                    onclick="removeFromInquiry(${c.idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    const empty = _cart.length === 0;
    document.getElementById('inquiryModalBody').innerHTML = empty
      ? `<div class="text-center text-muted py-4 small">詢價清單已清空</div>`
      : `<div class="p-3">
          <p class="text-muted small mb-3">
            <i class="fa-solid fa-building me-1"></i>${locName}
          </p>
          <table class="table table-sm table-bordered mb-2 quote-info-table">
            <thead class="table-light">
              <tr>
                <th>版位編號</th><th>尺寸</th>
                <th class="text-center">刊登月份</th>
                <th class="text-end">總報價</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr class="table-light fw-bold">
                <td colspan="4">合計</td>
                <td class="text-end text-danger" id="modalGrandTotal">NT$ ${formatPrice(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
          <p class="text-muted mb-0" style="font-size:11px">
            ※ 以上報價為出租價格乘以刊登月數，實際金額以簽約確認為準。
          </p>
        </div>`;
  }

  window.updateModalMonths = function(idx, val) {
    const months = Math.max(1, parseInt(val) || 1);
    const pos = _cart.findIndex(c => c.idx === idx);
    if (pos < 0) return;
    _cart[pos].months = months;
    _cart[pos].total  = calcSpaceTotal(_cart[pos].space, months);

    // 更新 modal 該列價格
    const priceEl = document.getElementById(`modalPrice_${idx}`);
    if (priceEl) priceEl.textContent = `NT$ ${formatPrice(_cart[pos].total)}`;

    // 更新合計
    const grand = _cart.reduce((s, c) => s + c.total, 0);
    const footEl = document.getElementById('modalGrandTotal');
    if (footEl) footEl.textContent = `NT$ ${formatPrice(grand)}`;

    // 同步卡片月份 input
    const cardInput = document.getElementById(`months_${idx}`);
    if (cardInput) cardInput.value = months;
    // 同步卡片顯示價格
    const cardPrice = document.getElementById(`price_${idx}`);
    if (cardPrice) cardPrice.textContent = `NT$ ${formatPrice(_cart[pos].total)}`;
  };

  window.removeFromInquiry = function(idx) {
    const pos = _cart.findIndex(c => c.idx === idx);
    if (pos < 0) return;
    _cart.splice(pos, 1);

    // 同步卡片按鈕
    const btn = document.getElementById(`cartBtn_${idx}`);
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-circle-plus me-1"></i>加入詢價';
      btn.classList.replace('btn-success', 'btn-danger');
    }

    document.getElementById('inquiryCount').textContent = _cart.length;
    if (_cart.length === 0) {
      document.getElementById('inquiryBar').classList.add('d-none');
      document.body.style.paddingBottom = '';
    }

    refreshInquiryModal();
  };

  window.showInquiryModal = function() {
    if (_cart.length === 0) return;
    refreshInquiryModal();
    new bootstrap.Modal(document.getElementById('inquiryModal')).show();
  };

})();

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
}

function openImgModal(url, alt) {
  const el = document.getElementById('imgModalSrc');
  el.src = url;
  el.alt = alt;
  new bootstrap.Modal(document.getElementById('imgModal')).show();
}

function formatPrice(n) {
  return Math.round(n).toLocaleString('zh-TW');
}

function showSpacesError(msg) {
  document.getElementById('spacesLoading').classList.add('d-none');
  const el = document.getElementById('spacesError');
  el.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-2"></i>${msg}`;
  el.classList.remove('d-none');
}

function validUrl(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (s === '' || s === '#N/A' || s === 'N/A' || !s.startsWith('http')) return '';

  // drive.google.com/uc?id=XXX 需登入，轉成 thumbnail 格式
  const ucMatch = s.match(/[?&]id=([\w-]+)/);
  if (ucMatch) {
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w400`;
  }

  // lh3.googleusercontent.com/d/XXX 直接可用
  return s;
}

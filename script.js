/* 公開サイト用スクリプト */
(function(){
  const DATA = Array.isArray(window.CRIME_DATA) ? window.CRIME_DATA : [];
  const state = { q:"", category:"", status:"", decade:"", area:"" };
  const els = {
    q: document.getElementById("q"),
    category: document.getElementById("categoryFilter"),
    status: document.getElementById("statusFilter"),
    decade: document.getElementById("decadeFilter"),
    area: document.getElementById("areaFilter"),
    cards: document.getElementById("cards"),
    count: document.getElementById("count"),
    dirs: document.getElementById("directories"),
    modalBackdrop: document.getElementById("modalBackdrop"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    closeModal: document.getElementById("closeModal")
  };
  const fallback = (v, alt="未設定") => String(v || "").trim() || alt;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function unique(key){
    return [...new Set(DATA.map(x => fallback(x[key],"")).filter(Boolean))].sort();
  }
  function fillSelect(el,key,label){
    if(!el) return;
    const opts = unique(key).filter(v => v !== "未設定");
    el.innerHTML = `<option value="">${label}すべて</option>` + opts.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
  }
  function makePhoto(item){
    return item.photo ? `<img src="${esc(item.photo)}" alt="">` : `<div>画像なし</div>`;
  }
  function matches(item){
    const q = state.q.trim().toLowerCase();
    const text = [item.name,item.category,item.status,item.area,item.summary,item.detail,item.decade].join(" ").toLowerCase();
    return (!q || text.includes(q))
      && (!state.category || fallback(item.category) === state.category)
      && (!state.status || fallback(item.status) === state.status)
      && (!state.decade || fallback(item.decade) === state.decade)
      && (!state.area || fallback(item.area) === state.area);
  }
  function render(){
    const rows = DATA.filter(matches);
    if(els.count) els.count.textContent = `${rows.length}件`;
    if(!els.cards) return;
    if(!rows.length){
      els.cards.innerHTML = `<div class="empty">該当する情報はありません。</div>`;
      return;
    }
    els.cards.innerHTML = rows.map(item => `
      <article class="card">
        <div class="photo">${makePhoto(item)}</div>
        <div class="card-body">
          <h3>${esc(fallback(item.name,"名称未入力"))}</h3>
          <div class="meta">
            <span class="badge status">${esc(fallback(item.status))}</span>
            <span class="badge category">${esc(fallback(item.category))}</span>
            <span class="badge">${esc(fallback(item.area))}</span>
            <span class="badge">${esc(fallback(item.decade))}</span>
          </div>
          <p class="summary">${esc(fallback(item.summary,"概要未入力"))}</p>
          <p class="small">更新日：${esc(fallback(item.updatedAt))}</p>
          <button type="button" onclick="showDetail('${esc(item.id)}')">詳細を見る</button>
        </div>
      </article>`).join("");
  }
  window.showDetail = function(id){
    const item = DATA.find(x => String(x.id) === String(id));
    if(!item) return;
    els.modalTitle.textContent = fallback(item.name,"名称未入力");
    const source = item.sourceUrl ? `<a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceUrl)}</a>` : "未設定";
    els.modalBody.innerHTML = `
      <div class="preview-grid">
        <div class="photo">${makePhoto(item)}</div>
        <dl class="detail-grid">
          <dt>氏名</dt><dd>${esc(fallback(item.name,"名称未入力"))}</dd>
          <dt>年齢</dt><dd>${esc(fallback(item.age))}</dd>
          <dt>性別</dt><dd>${esc(fallback(item.gender))}</dd>
          <dt>罪状カテゴリ</dt><dd>${esc(fallback(item.category))}</dd>
          <dt>状況</dt><dd>${esc(fallback(item.status))}</dd>
          <dt>年代</dt><dd>${esc(fallback(item.decade))}</dd>
          <dt>地域</dt><dd>${esc(fallback(item.area))}</dd>
          <dt>概要</dt><dd>${esc(fallback(item.summary,"概要未入力"))}</dd>
          <dt>詳細</dt><dd>${esc(fallback(item.detail,"詳細未入力"))}</dd>
          <dt>出典URL</dt><dd>${source}</dd>
          <dt>更新日</dt><dd>${esc(fallback(item.updatedAt))}</dd>
        </dl>
      </div>`;
    els.modalBackdrop.style.display = "flex";
  };
  function closeModal(){ if(els.modalBackdrop) els.modalBackdrop.style.display = "none"; }
  function setFilter(key,val){
    state[key] = val || "";
    const map = {category:els.category,status:els.status,decade:els.decade,area:els.area};
    if(map[key]) map[key].value = state[key];
    render();
  }
  function renderDirs(){
    if(!els.dirs) return;
    const groups = [
      ["年代別","decade"],["罪状別","category"],["状況別","status"],["地域別","area"]
    ];
    els.dirs.innerHTML = groups.map(([label,key]) => {
      const vals = unique(key).filter(v => v !== "未設定");
      return `<div class="dir-group"><strong>${label}</strong><div class="chips">${
        vals.length ? vals.map(v => `<button class="chip" type="button" data-key="${key}" data-val="${esc(v)}">${esc(v)}</button>`).join("") : `<span class="small">項目なし</span>`
      }</div></div>`;
    }).join("");
    els.dirs.querySelectorAll(".chip").forEach(btn => btn.addEventListener("click",()=>setFilter(btn.dataset.key,btn.dataset.val)));
  }
  ["category","status","decade","area"].forEach(k => fillSelect(els[k], k, {category:"罪状",status:"状況",decade:"年代",area:"地域"}[k]));
  renderDirs();
  if(els.q) els.q.addEventListener("input", e => {state.q=e.target.value;render();});
  if(els.category) els.category.addEventListener("change", e => {state.category=e.target.value;render();});
  if(els.status) els.status.addEventListener("change", e => {state.status=e.target.value;render();});
  if(els.decade) els.decade.addEventListener("change", e => {state.decade=e.target.value;render();});
  if(els.area) els.area.addEventListener("change", e => {state.area=e.target.value;render();});
  const reset = document.getElementById("resetFilters");
  if(reset) reset.addEventListener("click", ()=>{
    Object.keys(state).forEach(k=>state[k]="");
    [els.q,els.category,els.status,els.decade,els.area].forEach(el=>{if(el)el.value=""});
    render();
  });
  if(els.closeModal) els.closeModal.addEventListener("click", closeModal);
  if(els.modalBackdrop) els.modalBackdrop.addEventListener("click", e => { if(e.target === els.modalBackdrop) closeModal(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });
  render();
})();

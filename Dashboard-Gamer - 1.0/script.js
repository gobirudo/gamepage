// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRPwetuqYNNMQ4DiFWKu9Z_4fEbqrawCo",
  authDomain: "dbdashgobirudo.firebaseapp.com",
  databaseURL: "https://dbdashgobirudo-default-rtdb.firebaseio.com",
  projectId: "dbdashgobirudo",
  storageBucket: "dbdashgobirudo.firebasestorage.app",
  messagingSenderId: "84575261401",
  appId: "1:84575261401:web:6e7b534f2e57e16808e4c8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const USER_ID = 'gobirudo_oficial'; 

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navButtons = document.querySelectorAll('.nav-btn');
    const filterBar = document.getElementById('filter-bar');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const platformFilter = document.getElementById('platform-filter');
    const modal = document.getElementById('modal-form');
    const gameForm = document.getElementById('game-form');
    const adminTrigger = document.getElementById('admin-trigger');

    let zerados = [], wishlist = [], current = { game: 'Nenhum Jogo', img: '', nota: '0' }, currentTab = 'dash';
    
    // IMPORTANTE: Verifica se a URL contém "admin" para ativar os botões de edição
    const isAdmin = window.location.pathname.includes('admin.html');
    
    if(adminTrigger) {
        adminTrigger.onclick = () => {
            if(isAdmin) {
                window.location.href = 'index.html'; 
            } else {
                window.location.href = 'login.html'; 
            }
        };
    }

    const save = () => db.ref('users/' + USER_ID).set({ zerados, wishlist, current });

    const getScoreBadge = (n) => {
        let nota = parseFloat(n) || 0;
        let color = '#ff4a4a'; 
        if (nota >= 8) color = '#2fdc9c'; 
        else if (nota >= 6) color = '#4aa3ff'; 
        else if (nota >= 4) color = '#ffcc66'; 

        return `
            <div class="rating-badge-inline" style="border: 1px solid ${color}; color: ${color}; box-shadow: 0 0 8px ${color}44;">
                ${nota.toFixed(1)}
            </div>
        `;
    };

    db.ref('users/' + USER_ID).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            zerados = data.zerados || [];
            wishlist = data.wishlist || [];
            current = data.current || { game: 'Nenhum Jogo', img: '', nota: '0' };
            updatePlatformFilter();
            currentTab === 'dash' ? loadDash() : renderList();
        }
    });

    const updatePlatformFilter = () => {
        const allGames = [...zerados, ...wishlist];
        const platforms = [...new Set(allGames.map(g => g.plataforma).filter(p => p))];
        platformFilter.innerHTML = '<option value="all">Todas Plataformas</option>' + 
            platforms.map(p => `<option value="${p}">${p}</option>`).join('');
    };

    window.loadDash = () => {
        if(filterBar) filterBar.style.display = 'none';
        contentArea.className = 'main-layout dash-mode';
        contentArea.innerHTML = `
            <aside style="display:flex; flex-direction:column; gap:15px;">
                <section class="card" ${isAdmin ? 'onclick="openModal(\'current\')"' : ''} style="${isAdmin ? 'cursor:pointer' : ''}">
                    <div class="label-bar">🕹️ JOGANDO AGORA</div>
                    <div class="game-img-container" style="height: 200px"><img src="${current.img}" class="game-img" onerror="this.src='https://placehold.co/400x600/101418/2fdc9c?text=Capa'"></div>
                    <div style="padding:12px; text-align:center">
                        <span class="game-title">${current.game}</span>
                        <div class="meta-row" style="justify-content:center">
                             <span class="tag">${current.plataforma || 'STATION'}</span>
                        </div>
                    </div>
                </section>
                <section class="card" style="flex:1; align-items:center; justify-content:center; padding:20px">
                    <div class="label-bar" style="width:100%; position:absolute; top:0">📊 BIBLIOTECA</div>
                    <div style="font-size:3rem; color:var(--neon-blue); font-weight:900; text-shadow: 0 0 20px rgba(74,163,255,0.4)">${zerados.length + wishlist.length}</div>
                    <div style="font-size:0.6rem; color:var(--text-dim); letter-spacing:2px">JOGOS TOTAIS</div>
                </section>
            </aside>
            <div class="rankings-grid">
                <section class="card card-scrollable"><div class="label-bar">🏆 TOP ZERADOS</div><div id="m-z" class="scroll-area"></div></section>
                <section class="card card-scrollable"><div class="label-bar">💎 WISHLIST PRIORITÁRIA</div><div id="m-w" class="scroll-area"></div></section>
            </div>`;
        renderMini(zerados, 'm-z', 'zerados');
        renderMini(wishlist, 'm-w', 'wishlist');
    };

    const renderMini = (data, id, type) => {
        const sorted = [...data].sort((a, b) => parseFloat(b.nota) - parseFloat(a.nota)).slice(0, 12);
        const targetDiv = document.getElementById(id);
        if(!targetDiv) return;
        targetDiv.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:10px;">
            ${sorted.map(g => `
                <div class="card" ${isAdmin ? `onclick="openModal('${type}', ${data.indexOf(g)})"` : ''} style="${isAdmin ? 'cursor:pointer;' : ''} background:rgba(0,0,0,0.4)!important">
                    <div class="game-img-container"><img src="${g.img}" class="game-img" onerror="this.src='https://placehold.co/400x600/101418/2fdc9c?text=Capa'"></div>
                    <div style="padding:8px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <span class="game-title-mini">${g.game}</span>
                        <div class="meta-row" style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="tag" style="font-size:0.5rem; padding:1px 4px">${g.plataforma || 'PC'}</span>
                            ${type === 'zerados' ? getScoreBadge(g.nota) : ''}
                        </div>
                    </div>
                </div>`).join('')}</div>`;
    };

    window.renderList = () => {
        const data = currentTab === 'zerados' ? zerados : wishlist;
        const term = searchInput.value.toLowerCase();
        const plat = platformFilter.value;
        const sort = sortSelect.value;
        let filtered = data.filter(g => g.game.toLowerCase().includes(term) && (plat === 'all' || g.plataforma === plat));
        
        if (sort === 'az') filtered.sort((a, b) => a.game.localeCompare(b.game));
        if (sort === 'za') filtered.sort((a, b) => b.game.localeCompare(a.game));
        if (sort === 'nota-desc') filtered.sort((a, b) => parseFloat(b.nota) - parseFloat(a.nota));
        if (sort === 'nota-asc') filtered.sort((a, b) => parseFloat(a.nota) - parseFloat(b.nota));

        contentArea.className = 'main-layout list-mode';
        contentArea.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
            ${isAdmin ? `<div class="card" onclick="openModal('${currentTab}')" style="border: 2px dashed var(--border)!important; align-items:center; justify-content:center; min-height:220px; cursor:pointer; background:transparent!important">➕ NOVO JOGO</div>` : ''}
            ${filtered.map(g => `
                <div class="card">
                    <div class="game-img-container" style="height:240px"><img src="${g.img}" class="game-img" onerror="this.src='https://placehold.co/400x600/101418/2fdc9c?text=Capa'"></div>
                    <div style="padding:15px">
                        <span class="game-title">${g.game}</span>
                        <div class="meta-row">
                            <span class="tag">${g.plataforma || 'N/A'}</span>
                            <span class="tag genre">${g.genero || 'Ação'}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px">
                            ${currentTab === 'zerados' ? `
                                <div style="display:flex; align-items:center; gap:5px">
                                    <span style="font-size:0.55rem; color:var(--text-dim)">SCORE</span>
                                    ${getScoreBadge(g.nota)}
                                </div>
                            ` : `<span class="tag" style="border-color:var(--neon-pink); color:var(--neon-pink); font-weight:bold">❤️ ${g.nota}%</span>`}
                            
                            ${isAdmin ? `<div style="display:flex; gap:6px"><button class="backup-btn" onclick="openModal('${currentTab}', ${data.indexOf(g)})" style="padding:4px 8px">✏️</button><button class="backup-btn" onclick="deleteItem('${currentTab}', ${data.indexOf(g)})" style="color:#ff4a4a; padding:4px 8px">✖</button></div>` : ''}
                        </div>
                    </div>
                </div>`).join('')}</div>`;
    };

    window.openModal = (type, index = null) => {
        document.getElementById('current-page-type').value = type;
        document.getElementById('edit-index').value = index !== null ? index : "";
        const g = (type === 'current') ? current : (index !== null ? (type === 'zerados' ? zerados[index] : wishlist[index]) : {});
        document.getElementById('form-game').value = g.game || '';
        document.getElementById('form-img').value = g.img || '';
        document.getElementById('form-extra').value = g.plataforma || '';
        document.getElementById('form-genero').value = g.genero || '';
        document.getElementById('form-nota').value = g.nota || '';
        modal.style.display = 'flex';
    };

    window.closeModal = () => modal.style.display = 'none';

    gameForm.onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('current-page-type').value;
        const index = document.getElementById('edit-index').value;
        const newData = {
            game: document.getElementById('form-game').value, 
            img: document.getElementById('form-img').value,
            plataforma: document.getElementById('form-extra').value, 
            genero: document.getElementById('form-genero').value,
            nota: document.getElementById('form-nota').value
        };
        if (type === 'current') current = newData;
        else if (index !== "") { type === 'zerados' ? zerados[index] = newData : wishlist[index] = newData; }
        else { type === 'zerados' ? zerados.push(newData) : wishlist.push(newData); }
        save(); closeModal();
    };

    window.deleteItem = (type, i) => { if (confirm('Remover este jogo?')) { type === 'zerados' ? zerados.splice(i, 1) : wishlist.splice(i, 1); save(); } };

    navButtons.forEach(btn => btn.onclick = () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-page');
        if (currentTab === 'dash') loadDash(); else { if(filterBar) filterBar.style.display = 'flex'; renderList(); }
    });

    if(searchInput) searchInput.oninput = renderList;
    if(sortSelect) sortSelect.onchange = renderList;
    if(platformFilter) platformFilter.onchange = renderList;

    window.exportBackup = () => {
        const data = { zerados, wishlist, current };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_games_${new Date().toLocaleDateString()}.json`;
        a.click();
    };

    window.importBackup = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (confirm('Isso irá substituir todos os seus jogos atuais. Deseja continuar?')) {
                    zerados = data.zerados || [];
                    wishlist = data.wishlist || [];
                    current = data.current || { game: 'Nenhum Jogo', img: '', nota: '0' };
                    save();
                    alert('Backup restaurado com sucesso!');
                    location.reload();
                }
            } catch (err) {
                alert('Erro ao ler o arquivo de backup. Verifique se é um JSON válido.');
            }
        };
        reader.readAsText(file);
    };
});

// =======================
// TEMA — APENAS CORES
// =======================
function setTheme(theme) {
  document.body.classList.remove(
    'theme-default',
    'theme-green',
    'theme-orange',
    'theme-pink',
    'theme-white'
  );

  document.body.classList.add('theme-' + theme);
  localStorage.setItem('gobirudo_theme', theme);
}

// carrega tema salvo
(function () {
  const saved = localStorage.getItem('gobirudo_theme') || 'default';
  setTheme(saved);
})();
``
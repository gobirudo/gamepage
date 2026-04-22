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

    // Star Rating System
    let selectedStars = 0;
    const stars = document.querySelectorAll('.star');
    const starsInput = document.getElementById('form-stars');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedStars = parseInt(star.dataset.rating);
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', () => {
            const hoverRating = parseInt(star.dataset.rating);
            highlightStars(hoverRating);
        });
    });
    
    document.getElementById('star-rating').addEventListener('mouseleave', () => {
        updateStarDisplay();
    });
    
    function updateStarDisplay() {
        highlightStars(selectedStars);
        if (starsInput) starsInput.value = selectedStars;
    }
    
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    let zerados = [], wishlist = [], current = { game: 'Nenhum Jogo', img: '', nota: '0' }, currentTab = 'dash';
    
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
            <aside style="display:flex; flex-direction:column; gap:10px;">
                <!-- BIO Card -->
                <section class="card bio-card">
                    <div class="label-bar">GAMER BIO</div>
                    <div style="padding:16px; text-align:center">
                        <div class="bio-avatar">
                            <div class="avatar-placeholder">G</div>
                        </div>
                        <h3 class="bio-name">GOBIRUDO</h3>
                        <p class="bio-title">Gamer | IT Analyst Infrastructure | Guitarrist | Skater</p>
                        <div class="bio-stats">
                            <div class="stat-item">
                                <span class="stat-number">${zerados.length}</span>
                                <span class="stat-label">ZERADOS</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${wishlist.length}</span>
                                <span class="stat-label">WISHLIST</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${Math.round((zerados.filter(g => g.nota >= 8).length / Math.max(zerados.length, 1)) * 100)}%</span>
                                <span class="stat-label">SUCCESS</span>
                            </div>
                        </div>
                        <div class="bio-quote">
                            "Do código ao solo, dos riffs aos combos - vida é um grande game!"
                        </div>
                    </div>
                </section>
                
                <section class="card" ${isAdmin ? 'onclick="openModal(\'current\')"' : ''} style="${isAdmin ? 'cursor:pointer' : ''}">
                    <div class="label-bar">JOGANDO AGORA</div>
                    <div class="game-img-container" style="height: 160px"><img src="${current.img}" class="game-img" onerror="this.src='https://placehold.co/400x600/101418/2fdc9c?text=Capa'"></div>
                    <div style="padding:8px; text-align:center">
                        <span class="game-title">${current.game}</span>
                        <div class="meta-row" style="justify-content:center">
                             <span class="tag">${current.plataforma || 'STATION'}</span>
                        </div>
                    </div>
                </section>
            </aside>
            <div class="rankings-grid">
                <section class="card card-scrollable"><div class="label-bar">TOP ZERADOS</div><div id="m-z" class="scroll-area"></div></section>
                <section class="card card-scrollable"><div class="label-bar">WISHLIST PRIORITÁRIA</div><div id="m-w" class="scroll-area"></div></section>
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
                                <div style="display:flex; flex-direction:column; gap:4px">
                                    <div style="display:flex; align-items:center; gap:5px">
                                        <span style="font-size:0.55rem; color:var(--text-dim)">SCORE</span>
                                        ${getScoreBadge(g.nota)}
                                    </div>
                                    ${g.horas ? `<div style="display:flex; align-items:center; gap:5px; font-size:0.75rem; color:var(--neon-green); margin-top:2px; font-weight:bold"><span>🕒</span><span>${g.horas}</span></div>` : ''}
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
        document.getElementById('form-horas').value = g.horas || '';
        document.getElementById('form-review').value = g.review || '';
        document.getElementById('form-tags').value = g.tags || '';
        
        // Set star rating
        selectedStars = g.stars || 0;
        updateStarDisplay();
        
        modal.style.display = 'flex';
    };

    window.closeModal = () => modal.style.display = 'none';

    gameForm.onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('current-page-type').value;
        const index = document.getElementById('edit-index').value;
        
        let horasVal = document.getElementById('form-horas').value.trim();
        // Se o usuário digitou só número, coloca o "h"
 // Substitua o bloco das horas por este:
if(horasVal && !isNaN(horasVal)) {
    // Esse \u00A0 é o código para um espaço real que o navegador não ignora
    horasVal = horasVal + '\u00A0h'; 
}

        const newData = {
            game: document.getElementById('form-game').value, 
            img: document.getElementById('form-img').value,
            plataforma: document.getElementById('form-extra').value, 
            genero: document.getElementById('form-genero').value,
            nota: document.getElementById('form-nota').value,
            horas: horasVal,
            review: document.getElementById('form-review').value,
            tags: document.getElementById('form-tags').value,
            stars: selectedStars
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

function setTheme(theme) {
  document.body.classList.remove('theme-cyberpunk','theme-emerald','theme-cat','theme-oceanic','theme-highcontrast');
  if (theme && theme !== 'default') {
    document.body.classList.add('theme-' + theme);
  }
  localStorage.setItem('gobirudo_theme', theme);
}

// Menu Mobile Functions
function toggleMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const overlay = document.getElementById('nav-overlay');
  
  menuToggle.classList.toggle('active');
  nav.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}

// Theme Cycle Function
const themes = ['default', 'cyberpunk', 'emerald', 'cat', 'oceanic', 'highcontrast'];
let currentThemeIndex = 0;

function cycleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const newTheme = themes[currentThemeIndex];
  setTheme(newTheme);
  
  // Add visual feedback
  const themeBtn = document.querySelector('.theme-toggle-btn');
  themeBtn.style.transform = 'scale(1.2) rotate(360deg)';
  setTimeout(() => {
    themeBtn.style.transform = '';
  }, 300);
}

// Audio Player Functions
let currentAudio = null;
let isPlaying = false;

const audioTracks = {
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  synth: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  chill: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  rock: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  electronic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  retro: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  battle: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
};

function toggleAudio() {
  const playBtn = document.getElementById('play-pause-btn');
  const audioIcon = playBtn.querySelector('.audio-icon');
  const audioBars = document.querySelectorAll('.audio-bar');
  
  if (!currentAudio) {
    const trackSelector = document.getElementById('track-selector');
    const selectedTrack = trackSelector.value;
    currentAudio = new Audio(audioTracks[selectedTrack]);
    currentAudio.loop = true;
    currentAudio.volume = 0.3;
    
    currentAudio.addEventListener('ended', () => {
      if (isPlaying) {
        currentAudio.play();
      }
    });
  }
  
  if (isPlaying) {
    currentAudio.pause();
    audioIcon.textContent = 'play';
    audioBars.forEach(bar => bar.classList.remove('playing'));
    isPlaying = false;
  } else {
    currentAudio.play().catch(e => console.log('Audio play failed:', e));
    audioIcon.textContent = 'pause';
    audioBars.forEach(bar => bar.classList.add('playing'));
    isPlaying = true;
  }
}

function changeTrack() {
  const trackSelector = document.getElementById('track-selector');
  const selectedTrack = trackSelector.value;
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  currentAudio = new Audio(audioTracks[selectedTrack]);
  currentAudio.loop = true;
  currentAudio.volume = 0.3;
  
  if (isPlaying) {
    currentAudio.play().catch(e => console.log('Audio play failed:', e));
  }
}

// Initialize theme on load
(function () {
  const saved = localStorage.getItem('gobirudo_theme') || 'default';
  setTheme(saved);
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    
    if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
      toggleMobileMenu();
    }
  });
  
  // Handle escape key for mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const nav = document.querySelector('.nav');
      if (nav.classList.contains('active')) {
        toggleMobileMenu();
      }
    }
  });
})();
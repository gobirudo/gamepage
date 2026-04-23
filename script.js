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

    let zerados = [], wishlist = [], dropados = [], current = { game: 'Nenhum Jogo', img: '', nota: '0' }, currentTab = 'dash';
    
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

    const save = () => db.ref('users/' + USER_ID).set({ zerados, wishlist, dropados, current });

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
            dropados = data.dropados || [];
            current = data.current || { game: 'Nenhum Jogo', img: '', nota: '0' };
            updatePlatformFilter();
            currentTab === 'dash' ? loadDash() : renderList();
        }
    });

    const updatePlatformFilter = () => {
        const allGames = [...zerados, ...wishlist, ...dropados];
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
                                <span class="stat-number">${dropados.length}</span>
                                <span class="stat-label">DROPADOS</span>
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
                        ${isAdmin && current.game !== 'Nenhum Jogo' ? `<button onclick="askZerado()" style="margin-top:10px; padding:6px 12px; background:var(--neon-green); color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Zerado?</button>` : ''}
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
        const data = currentTab === 'zerados' ? zerados : currentTab === 'wishlist' ? wishlist : dropados;
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
            ${isAdmin ? `<div class="card" onclick="openModal('${currentTab}')" style="border: 2px dashed var(--border)!important; align-items:center; justify-content:center; min-height:220px; cursor:pointer; background:transparent!important">+ NOVO JOGO</div>` : ''}
            ${filtered.map(g => `
                <div class="card" ${g.review && g.review.trim() ? `onclick="toggleCommentInline(${data.indexOf(g)})" style="cursor:pointer;"` : ''}>
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
                                ${g.horas ? `<div style="display:flex; align-items:center; gap:5px; font-size:0.75rem; color:var(--neon-green); margin-top:2px; font-weight:bold"><span></span><span>${g.horas}</span></div>` : ''}
                            </div>
                        ` : currentTab === 'wishlist' ? `<span class="tag" style="border-color:var(--neon-pink); color:var(--neon-pink); font-weight:bold"> ${g.nota}%</span>` : `<span class="tag" style="border-color:#ff4a4a; color:#ff4a4a; font-weight:bold"> ${g.nota || 'N/A'}</span>`}
                            

                            ${currentTab === 'wishlist' && isAdmin ? `<button onclick="event.stopPropagation(); askZeradoWishlist(${data.indexOf(g)})" style="margin-top:8px; padding:4px 8px; background:var(--neon-green); color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.7rem; width:100%;">Zerado?</button>` : ''}
                            ${isAdmin ? `
                            <div style="display:flex; justify-content:flex-end; margin-top:12px;">
                                <button class="icon-btn" onclick="event.stopPropagation(); openModal('${currentTab}', ${data.indexOf(g)})" title="Editar" style="width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05)); color:var(--text); border:1px solid var(--border); border-radius:8px; cursor:pointer; font-size:0.75rem; font-weight:600; transition:all 0.3s ease; box-shadow:0 2px 8px rgba(255, 255, 255, 0.1);">edit</button>
                                <button class="icon-btn" onclick="event.stopPropagation(); deleteItem('${currentTab}', ${data.indexOf(g)})" title="Excluir" style="width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(255, 74, 74, 0.3), rgba(255, 74, 74, 0.1)); color:#ff4a4a; border:1px solid #ff4a4a; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; transition:all 0.3s ease; box-shadow:0 2px 8px rgba(255, 74, 74, 0.3);">×</button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    };

    window.openModal = (type, index = null) => {
        document.getElementById('current-page-type').value = type;
        document.getElementById('edit-index').value = index !== null ? index : "";
        const g = (type === 'current') ? current : (index !== null ? (type === 'zerados' ? zerados[index] : type === 'wishlist' ? wishlist[index] : dropados[index]) : {});
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

    window.toggleComment = (index) => {
        const data = currentTab === 'zerados' ? zerados : currentTab === 'wishlist' ? wishlist : dropados;
        const game = data[index];
        const commentModal = document.getElementById('comment-modal');
        const commentContent = document.getElementById('comment-content');
        
        commentContent.textContent = game.review || 'Nenhum comentário disponível.';
        commentModal.style.display = 'flex';
    };

    window.closeCommentModal = () => {
        document.getElementById('comment-modal').style.display = 'none';
    };

    window.toggleCommentInline = (index) => {
        const data = currentTab === 'zerados' ? zerados : currentTab === 'wishlist' ? wishlist : dropados;
        const game = data[index];
        const cards = document.querySelectorAll('.card');
        
        // Encontra o card correto baseado no índice do jogo
        let targetCard;
        if (isAdmin && currentTab !== 'dash') {
            // Em páginas de lista com admin, pula o primeiro card (+ NOVO JOGO)
            targetCard = cards[index + 1];
        } else {
            // Dashboard ou usuário normal, usa o índice direto
            targetCard = cards[index];
        }
        
        // Remove todos os overlays abertos
        document.querySelectorAll('.comment-overlay').forEach(overlay => overlay.remove());
        
        if (!game.review || game.review.trim() === '') {
            // Se não tiver comentário, não faz nada
            return;
        }
        
        // Cria overlay de comentário
        const overlay = document.createElement('div');
        overlay.className = 'comment-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(5, 6, 10, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid var(--neon-blue);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            cursor: default;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <h4 style="color: var(--neon-blue); margin-bottom: 15px; text-align: center;">COMENTÁRIO</h4>
            <p style="color: var(--text); text-align: center; line-height: 1.5; font-size: 0.9rem;">${game.review}</p>
            <small style="color: var(--text-dim); margin-top: 15px;">Fecha automaticamente em 5 segundos</small>
        `;
        
        // Adiciona ao card
        targetCard.style.position = 'relative';
        targetCard.appendChild(overlay);
        
        // Fecha automaticamente após 5 segundos
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => overlay.remove(), 300);
            }
        }, 5000);
        
        // Adiciona animações CSS se não existirem
        if (!document.querySelector('#comment-animations')) {
            const style = document.createElement('style');
            style.id = 'comment-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }
    };

    window.showFinishGameModal = () => {
        document.getElementById('finish-game-modal').style.display = 'flex';
    };

    window.closeFinishGameModal = () => {
        document.getElementById('finish-game-modal').style.display = 'none';
    };

    window.moveGame = (destination) => {
        if (current.game !== 'Nenhum Jogo') {
            // Adiciona nota padrão se não existir
            if (!current.nota || current.nota === '0') {
                current.nota = destination === 'zerados' ? '8' : '5';
            }
            
            // Move para o array correspondente
            if (destination === 'zerados') {
                zerados.push({...current});
            } else {
                dropados.push({...current});
            }
            
            // Limpa o jogo atual
            current = { game: 'Nenhum Jogo', img: '', nota: '0' };
            
            save();
            closeFinishGameModal();
            loadDash();
        }
    };

    window.askZerado = () => {
        const modal = document.getElementById('finish-game-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="color:var(--neon-green); margin-bottom:15px; text-align:center;">ZERADO?</h3>
                <p style="text-align:center; margin-bottom:20px; color:var(--text);">Você zerou este jogo?</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="confirmZerado()" class="backup-btn" style="flex:1; background:var(--neon-green); color:#000;">SIM</button>
                    <button onclick="askDropado()" class="backup-btn" style="flex:1;">NÃO</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    };

    window.askDropado = () => {
        const modal = document.getElementById('finish-game-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="color:#ff4a4a; margin-bottom:15px; text-align:center;">DROPADO?</h3>
                <p style="text-align:center; margin-bottom:20px; color:var(--text);">Você quer dropar este jogo?</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="confirmDropado()" class="backup-btn" style="flex:1; background:#ff4a4a; color:#fff;">SIM</button>
                    <button onclick="closeFinishGameModal()" class="backup-btn" style="flex:1;">NÃO</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    };

    window.confirmZerado = () => {
        if (current.game !== 'Nenhum Jogo') {
            if (!current.nota || current.nota === '0') {
                current.nota = '8';
            }
            zerados.push({...current});
            current = { game: 'Nenhum Jogo', img: '', nota: '0' };
            save();
            closeFinishGameModal();
            loadDash();
        }
    };

    window.confirmDropado = () => {
        if (current.game !== 'Nenhum Jogo') {
            if (!current.nota || current.nota === '0') {
                current.nota = '5';
            }
            dropados.push({...current});
            current = { game: 'Nenhum Jogo', img: '', nota: '0' };
            save();
            closeFinishGameModal();
            loadDash();
        }
    };

    window.askZeradoWishlist = (index) => {
        const game = wishlist[index];
        const modal = document.getElementById('finish-game-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="color:var(--neon-green); margin-bottom:15px; text-align:center;">ZERADO?</h3>
                <p style="text-align:center; margin-bottom:20px; color:var(--text);">Você zerou "${game.game}"?</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="confirmZeradoWishlist(${index})" class="backup-btn" style="flex:1; background:var(--neon-green); color:#000;">SIM</button>
                    <button onclick="askDropadoWishlist(${index})" class="backup-btn" style="flex:1;">NÃO</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    };

    window.askDropadoWishlist = (index) => {
        const game = wishlist[index];
        const modal = document.getElementById('finish-game-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3 style="color:#ff4a4a; margin-bottom:15px; text-align:center;">DROPADO?</h3>
                <p style="text-align:center; margin-bottom:20px; color:var(--text);">Você dropou "${game.game}"?</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="confirmDropadoWishlist(${index})" class="backup-btn" style="flex:1; background:#ff4a4a; color:#fff;">SIM</button>
                    <button onclick="closeFinishGameModal()" class="backup-btn" style="flex:1;">NÃO</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    };

    window.confirmZeradoWishlist = (index) => {
        const game = wishlist[index];
        // Adiciona nota padrão se não existir
        if (!game.nota || game.nota === '0') {
            game.nota = '8';
        }
        
        // Move para zerados e remove da wishlist
        zerados.push({...game});
        wishlist.splice(index, 1);
        
        save();
        closeFinishGameModal();
        renderList();
    };

    window.confirmDropadoWishlist = (index) => {
        const game = wishlist[index];
        // Adiciona nota padrão se não existir
        if (!game.nota || game.nota === '0') {
            game.nota = '5';
        }
        
        // Move para dropados e remove da wishlist
        dropados.push({...game});
        wishlist.splice(index, 1);
        
        save();
        closeFinishGameModal();
        renderList();
    };

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
        else if (index !== "") { type === 'zerados' ? zerados[index] = newData : type === 'wishlist' ? wishlist[index] = newData : dropados[index] = newData; }
        else { type === 'zerados' ? zerados.push(newData) : type === 'wishlist' ? wishlist.push(newData) : dropados.push(newData); }
        save(); closeModal();
    };

    window.deleteItem = (type, i) => { if (confirm('Remover este jogo?')) { type === 'zerados' ? zerados.splice(i, 1) : type === 'wishlist' ? wishlist.splice(i, 1) : dropados.splice(i, 1); save(); } };

    navButtons.forEach(btn => btn.onclick = () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-page');
        if (currentTab === 'dash') loadDash(); else { 
            if(filterBar) filterBar.style.display = 'flex'; 
            // Define ordenação padrão para Meus Zerados como maior nota
            if (currentTab === 'zerados' && sortSelect) {
                sortSelect.value = 'nota-desc';
            }
            renderList(); 
        }
    });

    if(searchInput) searchInput.oninput = renderList;
    if(sortSelect) sortSelect.onchange = renderList;
    if(platformFilter) platformFilter.onchange = renderList;

    window.exportBackup = () => {
        const data = { zerados, wishlist, dropados, current };
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
                    dropados = data.dropados || [];
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
  document.body.classList.remove('theme-cyberpunk','theme-emerald','theme-cat','theme-oceanic','theme-highcontrast','theme-halloween','theme-christmas','theme-spring');
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
const themes = ['default', 'cyberpunk', 'emerald', 'cat', 'oceanic', 'highcontrast', 'halloween', 'christmas', 'spring', 'galaxy', 'sunset', 'neonnoir', 'aurora', 'vaporwave'];
let currentThemeIndex = 0;

function cycleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const newTheme = themes[currentThemeIndex];
  setTheme(newTheme);
  
  // Update theme name display
  updateThemeDisplay(newTheme);
  
  // Add visual feedback
  const themeBtn = document.querySelector('.theme-toggle-btn');
  themeBtn.style.transform = 'scale(1.2) rotate(360deg)';
  setTimeout(() => {
    themeBtn.style.transform = '';
  }, 300);
}

function updateThemeDisplay(theme) {
  const themeNameElement = document.getElementById('theme-name');
  if (themeNameElement) {
    // Capitalize first letter and format theme names
    const displayName = theme.charAt(0).toUpperCase() + theme.slice(1).replace(/([A-Z])/g, ' $1');
    themeNameElement.textContent = displayName;
    
    // Add animation
    themeNameElement.style.transform = 'scale(1.1)';
    themeNameElement.style.color = 'var(--neon-pink)';
    setTimeout(() => {
      themeNameElement.style.transform = '';
      themeNameElement.style.color = '';
    }, 300);
  }
}

// Initialize theme display on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('gobirudo_theme') || 'default';
  const themeIndex = themes.indexOf(savedTheme);
  currentThemeIndex = themeIndex >= 0 ? themeIndex : 0;
  updateThemeDisplay(themes[currentThemeIndex]);
});

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
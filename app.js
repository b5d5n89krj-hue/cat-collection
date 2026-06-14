// Supabase 配置
const SUPABASE_URL = 'https://hcyzgyrwmdvvfqtpncky.supabase.co';
const SUPABASE_KEY = 'sb_publishable_d3_gbtaKy8WWxYrAMpJuRg_TIvSa7Rj';

// 动物数据（从Supabase加载）
let catsData = [];

// 全局变量
let currentFilter = { location: 'all', status: 'all' };
let currentCat = null;
let totalCommentsCount = 0;

// 从Supabase加载动物数据
async function loadAnimalsData() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/animals?order=id`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();

        // 同时加载点赞数据
        const likesResponse = await fetch(`${SUPABASE_URL}/rest/v1/likes?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const likesData = await likesResponse.json();

        // 合并动物数据和点赞数据
        catsData = data.map(animal => {
            const likesInfo = likesData.find(l => l.cat_id === animal.id);
            return {
                ...animal,
                likes: likesInfo ? likesInfo.likes : 0
            };
        });
    } catch (error) {
        console.error('加载动物数据失败:', error);
    }
}

// 更新Supabase点赞数据
async function updateSupabaseLikes(catId, likes) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/likes?cat_id=eq.${catId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ likes: likes })
        });
    } catch (error) {
        console.error('更新点赞数据失败:', error);
    }
}

// 检查用户是否已点赞
function hasLiked(catId) {
    const liked = localStorage.getItem('likedCats') || '[]';
    return JSON.parse(liked).includes(catId);
}

// 标记用户已点赞
function markLiked(catId) {
    const liked = JSON.parse(localStorage.getItem('likedCats') || '[]');
    if (!liked.includes(catId)) {
        liked.push(catId);
        localStorage.setItem('likedCats', JSON.stringify(liked));
    }
}

// 加载评论数据
async function loadComments(catId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/comments?cat_id=eq.${catId}&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('加载评论失败:', error);
        return [];
    }
}

// 添加评论
async function addComment() {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();

    if (!content) {
        alert('请输入评论内容');
        return;
    }

    if (!currentCat) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                cat_id: currentCat.id,
                content: content
            })
        });

        if (response.ok) {
            input.value = '';
            // 重新加载评论
            const comments = await loadComments(currentCat.id);
            renderComments(comments);
            totalCommentsCount++;
            updateStats();
        }
    } catch (error) {
        console.error('添加评论失败:', error);
        alert('评论失败，请稍后重试');
    }
}

// 渲染评论
function renderComments(comments) {
    const container = document.getElementById('commentsList');

    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">暂无评论，快来抢沙发吧~</div>';
        return;
    }

    container.innerHTML = comments.map(comment => {
        const date = new Date(comment.created_at);
        const timeStr = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment-item">
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-time">📅 ${timeStr}</div>
            </div>
        `;
    }).join('');
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 加载总评论数
async function loadTotalComments() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/comments?select=id`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await response.json();
        totalCommentsCount = data.length;
    } catch (error) {
        console.error('加载评论数失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadAnimalsData(), loadTotalComments()]);
    renderCats();
    setupFilters();
    updateStats();
});

// 渲染动物卡片
function renderCats(filteredCats = null) {
    const grid = document.getElementById('catGrid');
    const cats = filteredCats || getFilteredCats();

    if (cats.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="emoji">😿</div>
                <h3>没有找到匹配的动物</h3>
                <p>试试其他筛选条件吧</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = cats.map(cat => `
        <div class="cat-card" onclick="openCatModal(${cat.id})">
            <div class="card-image">
                <img src="${cat.image}" alt="${cat.name}" loading="lazy">
            </div>
            <div class="card-content">
                <div class="card-name">
                    ${cat.name}
                    <span class="gender">${cat.gender}</span>
                </div>
                <div class="card-meta">
                    <span>📍 ${cat.location}</span>
                    <span>📅 ${cat.date}</span>
                </div>
                <div class="card-tags">
                    ${cat.status.map(s => {
                        let cls = '';
                        if (s === '健康') cls = 'green';
                        return `<span class="card-tag ${cls}">${s}</span>`;
                    }).join('')}
                </div>
                <div class="card-likes">❤️ ${cat.likes}</div>
            </div>
        </div>
    `).join('');
}

// 获取过滤后的动物
function getFilteredCats() {
    return catsData.filter(cat => {
        const locationMatch = currentFilter.location === 'all' || cat.location.includes(currentFilter.location);
        const statusMatch = currentFilter.status === 'all' || cat.status.includes(currentFilter.status);
        return locationMatch && statusMatch;
    });
}

// 设置筛选器
function setupFilters() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const filterType = tag.dataset.filter;
            const value = tag.dataset.value;

            currentFilter[filterType] = value;

            document.querySelectorAll(`.filter-tag[data-filter="${filterType}"]`).forEach(t => {
                t.classList.remove('active');
            });
            tag.classList.add('active');

            renderCats();
        });
    });
}

// 搜索功能
function searchCats() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        renderCats();
        return;
    }

    const filtered = catsData.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.location.includes(searchTerm) ||
        cat.personality.includes(searchTerm)
    );

    renderCats(filtered);
}

// 回车搜索
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCats();
    }
});

// 打开动物详情弹窗
async function openCatModal(catId) {
    currentCat = catsData.find(c => c.id === catId);
    if (!currentCat) return;

    document.getElementById('modalImage').src = currentCat.image;
    document.getElementById('modalName').textContent = currentCat.name;
    document.getElementById('modalLocation').textContent = currentCat.location;
    document.getElementById('modalPersonality').textContent = currentCat.personality;
    document.getElementById('modalDate').textContent = currentCat.date;
    document.getElementById('modalHealth').textContent = currentCat.health;
    document.getElementById('modalStory').textContent = currentCat.story;
    document.getElementById('modalLikes').textContent = currentCat.likes;

    // 设置点赞按钮状态
    const likeBtn = document.querySelector('.btn-like');
    if (hasLiked(catId)) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }

    // 设置标签
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = currentCat.status.map(s =>
        `<span class="info-tag">${s}</span>`
    ).join('');

    document.getElementById('catModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // 加载评论
    const comments = await loadComments(catId);
    renderComments(comments);
}

// 关闭弹窗
function closeModal() {
    document.getElementById('catModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 点赞功能
async function likeCat() {
    if (!currentCat) return;

    if (hasLiked(currentCat.id)) {
        // 取消点赞
        currentCat.likes--;
        const liked = JSON.parse(localStorage.getItem('likedCats') || '[]');
        const index = liked.indexOf(currentCat.id);
        if (index > -1) {
            liked.splice(index, 1);
            localStorage.setItem('likedCats', JSON.stringify(liked));
        }
        document.querySelector('.btn-like').classList.remove('liked');
    } else {
        // 点赞
        currentCat.likes++;
        markLiked(currentCat.id);
        document.querySelector('.btn-like').classList.add('liked');
    }

    document.getElementById('modalLikes').textContent = currentCat.likes;
    await updateSupabaseLikes(currentCat.id, currentCat.likes);
    renderCats();
    updateStats();
}

// 更新统计数据
async function updateStats() {
    const totalCats = document.getElementById('totalCats');
    const totalLocations = document.getElementById('totalLocations');
    const totalLikes = document.getElementById('totalLikes');
    const totalComments = document.getElementById('totalComments');

    const locations = new Set(catsData.map(c => c.location));
    const totalLikesCount = catsData.reduce((sum, c) => sum + c.likes, 0);

    animateNumber(totalCats, catsData.length);
    animateNumber(totalLocations, locations.size);
    animateNumber(totalLikes, totalLikesCount);
    animateNumber(totalComments, totalCommentsCount);
}

// 数字动画
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// 点击弹窗外部关闭
document.getElementById('catModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 导航栏滚动效果
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
    }

    lastScroll = currentScroll;
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

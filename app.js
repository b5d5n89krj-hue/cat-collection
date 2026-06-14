// 猫咪数据
const catsData = [
    {
        id: 1,
        name: "大橘",
        color: "橘猫",
        gender: "♂",
        location: "图书馆门口",
        personality: "亲人、贪吃、慵懒",
        health: "健康",
        status: ["健康"],
        date: "2024-09-15",
        image: "https://placekitten.com/400/300?image=1",
        story: "大橘是图书馆的常客，每天准时出现在门口晒太阳。它特别亲人，喜欢被摸肚皮，但对食物有着执着的追求。同学们都说它是'橘座大人'。",
        likes: 128
    },
    {
        id: 2,
        name: "小黑",
        color: "黑猫",
        gender: "♀",
        location: "三食堂",
        personality: "高冷、独立、优雅",
        health: "健康",
        status: ["健康"],
        date: "2024-10-20",
        image: "https://placekitten.com/400/300?image=2",
        story: "小黑是三食堂的守护神，总是优雅地蹲在角落里观察来往的学生。虽然看起来高冷，但熟悉之后会主动蹭你的腿。它的黑毛在阳光下会泛出微微的棕色光泽。",
        likes: 95
    },
    {
        id: 3,
        name: "奶糖",
        color: "白猫",
        gender: "♂",
        location: "女生宿舍楼下",
        personality: "粘人、爱叫、撒娇",
        health: "健康",
        status: ["健康"],
        date: "2025-01-08",
        image: "https://placekitten.com/400/300?image=3",
        story: "奶糖是女生宿舍的团宠，全身雪白，眼睛是漂亮的蓝色。它特别粘人，看到有人经过就会跑过去蹭腿。最近天气冷了，希望能有个温暖的家。",
        likes: 256
    },
    {
        id: 4,
        name: "阿狸",
        color: "狸花",
        gender: "♀",
        location: "操场看台",
        personality: "活泼、好奇、敏捷",
        health: "健康",
        status: ["健康"],
        date: "2024-11-12",
        image: "https://placekitten.com/400/300?image=4",
        story: "阿狸是操场的常客，喜欢在看台上晒太阳，偶尔会追着蝴蝶跑。它的花纹非常漂亮，是标准的狸花猫。经常能看到它矫健地跳上跳下。",
        likes: 78
    },
    {
        id: 5,
        name: "布丁",
        color: "橘猫",
        gender: "♂",
        location: "二食堂",
        personality: "温顺、老实、憨厚",
        health: "健康",
        status: ["健康"],
        date: "2025-02-14",
        image: "https://placekitten.com/400/300?image=5",
        story: "布丁是二食堂的吉祥物，圆滚滚的身材特别讨人喜欢。它从不抢食，总是等别的猫吃完再慢慢享用。同学们经常给它带好吃的。",
        likes: 167
    },
    {
        id: 6,
        name: "花花",
        color: "三花",
        gender: "♀",
        location: "花园长廊",
        personality: "安静、优雅、怕生",
        health: "待检查",
        status: ["待检查"],
        date: "2025-03-20",
        image: "https://placekitten.com/400/300?image=6",
        story: "花花是花园长廊的神秘居民，三色的毛发非常漂亮。它比较怕生，需要耐心相处才能获得它的信任。最近发现它有点瘦，可能需要更多关爱。",
        likes: 89
    },
    {
        id: 7,
        name: "警长",
        color: "奶牛",
        gender: "♂",
        location: "校门口",
        personality: "勇敢、忠诚、护院",
        health: "健康",
        status: ["健康"],
        date: "2024-08-05",
        image: "https://placekitten.com/400/300?image=7",
        story: "警长是校门口的守护者，黑白相间的花纹像穿了一件燕尾服。它每天都会在校门口迎接来往的师生，有时还会护送晚归的同学回宿舍。",
        likes: 203
    },
    {
        id: 8,
        name: "团子",
        color: "白猫",
        gender: "♀",
        location: "教学楼",
        personality: "聪明、爱学习、安静",
        health: "健康",
        status: ["健康"],
        date: "2025-04-10",
        image: "https://placekitten.com/400/300?image=8",
        story: "团子是教学楼的学霸猫，经常蹲在教室门口听课。它特别聪明，会自己开门，还喜欢趴在书上看。同学们都说它是'最用功的猫'。",
        likes: 145
    }
];

// 全局变量
let currentFilter = { color: 'all', location: 'all', status: 'all' };
let currentCat = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderCats();
    setupFilters();
    updateStats();
});

// 渲染猫咪卡片
function renderCats(filteredCats = null) {
    const grid = document.getElementById('catGrid');
    const cats = filteredCats || getFilteredCats();

    if (cats.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="emoji">😿</div>
                <h3>没有找到匹配的猫咪</h3>
                <p>试试其他筛选条件吧</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = cats.map(cat => `
        <div class="cat-card" onclick="openCatModal(${cat.id})">
            <div class="card-image">
                <img src="${cat.image}" alt="${cat.name}" loading="lazy">
                <span class="card-badge">${cat.color}</span>
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
                        else if (s === '待领养') cls = 'blue';
                        return `<span class="card-tag ${cls}">${s}</span>`;
                    }).join('')}
                </div>
                <div class="card-likes">❤️ ${cat.likes}</div>
            </div>
        </div>
    `).join('');
}

// 获取过滤后的猫咪
function getFilteredCats() {
    return catsData.filter(cat => {
        const colorMatch = currentFilter.color === 'all' || cat.color === currentFilter.color;
        const locationMatch = currentFilter.location === 'all' || cat.location.includes(currentFilter.location);
        const statusMatch = currentFilter.status === 'all' || cat.status.includes(currentFilter.status);
        return colorMatch && locationMatch && statusMatch;
    });
}

// 设置筛选器
function setupFilters() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const filterType = tag.dataset.filter;
            const value = tag.dataset.value;

            // 更新当前筛选
            currentFilter[filterType] = value;

            // 更新按钮状态
            document.querySelectorAll(`.filter-tag[data-filter="${filterType}"]`).forEach(t => {
                t.classList.remove('active');
            });
            tag.classList.add('active');

            // 重新渲染
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
        cat.color.includes(searchTerm) ||
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

// 打开猫咪详情弹窗
function openCatModal(catId) {
    currentCat = catsData.find(c => c.id === catId);
    if (!currentCat) return;

    document.getElementById('modalImage').src = currentCat.image;
    document.getElementById('modalName').textContent = currentCat.name;
    document.getElementById('modalLocation').textContent = currentCat.location;
    document.getElementById('modalColor').textContent = currentCat.color;
    document.getElementById('modalPersonality').textContent = currentCat.personality;
    document.getElementById('modalDate').textContent = currentCat.date;
    document.getElementById('modalHealth').textContent = currentCat.health;
    document.getElementById('modalStory').textContent = currentCat.story;
    document.getElementById('modalLikes').textContent = currentCat.likes;

    // 设置标签
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = currentCat.status.map(s =>
        `<span class="info-tag">${s}</span>`
    ).join('');

    document.getElementById('catModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
    document.getElementById('catModal').classList.remove('active');
    document.body.style.overflow = '';
}


// 更新统计数据
function updateStats() {
    const totalCats = document.getElementById('totalCats');
    const totalLocations = document.getElementById('totalLocations');
    const totalLikes = document.getElementById('totalLikes');
    const totalAdopted = document.getElementById('totalAdopted');

    const locations = new Set(catsData.map(c => c.location));
    const totalLikesCount = catsData.reduce((sum, c) => sum + c.likes, 0);
    const checkCount = catsData.filter(c => c.status.includes('待检查')).length;

    animateNumber(totalCats, catsData.length);
    animateNumber(totalLocations, locations.size);
    animateNumber(totalLikes, totalLikesCount);
    animateNumber(totalAdopted, checkCount);
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

// ============================================
// 번역
// ============================================
const translations = {
    ko: {
        'main-title': '💖 100퍼즐 도감 💖',
        'nav-all': '전체',
        'nav-attribute': '속성별',
        'nav-theme': '테마별',
        'nav-character': '캐릭터별',
        'nav-fortune': '오늘의 운세',
        'fortune-btn-text': '운세 보기'
    },
    en: {
        'main-title': '💖 100 Puzzle Encyclopedia 💖',
        'nav-all': 'All',
        'nav-attribute': 'By Attribute',
        'nav-theme': 'By Theme',
        'nav-character': 'By Character',
        'nav-fortune': 'Fortune',
        'fortune-btn-text': 'Get Fortune'
    },
    ja: {
        'main-title': '💖 100パズル図鑑 💖',
        'nav-all': '全体',
        'nav-attribute': '属性別',
        'nav-theme': 'テーマ別',
        'nav-character': 'キャラクター別',
        'nav-fortune': '今日の運勢',
        'fortune-btn-text': '運勢を見る'
    }
};

// ============================================
// 상태
// ============================================
let currentLang = 'ko';
let currentAttributeFilter = 'red';
let currentThemeFilter = null;
let currentCharacterFilter = null;

// ============================================
// 커서
// ============================================
const cursor = document.getElementById('cursor');
const modal = document.getElementById('modal');
let cursorX = 0, cursorY = 0, currentX = 0, currentY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    currentX += (cursorX - currentX) * 0.8;
    currentY += (cursorY - currentY) * 0.8;
    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener('mouseover', (e) => {
    const target = e.target;
    cursor.classList.toggle('hover', 
        target && (
            target.tagName === 'BUTTON' || 
            target.tagName === 'A' || 
            target.classList.contains('character-card') ||
            target.closest('button') ||
            target.closest('a') ||
            target.closest('.character-card')
        )
    );
});

// ============================================
// 네비게이션
// ============================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        window.scrollTo(0, 0); // 스크롤 맨 위로
        
        const targetSection = btn.getAttribute('data-section');
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        if (targetSection === 'attribute') {
            currentAttributeFilter = 'red';
            renderAttributeFilters();
            renderByAttribute('red');
        } else if (targetSection === 'theme') {
            const themes = getUniqueThemes();
            if (themes.length > 0) {
                currentThemeFilter = themes[0];
                renderThemeFilters();
                renderByTheme(themes[0]);
            }
        } else if (targetSection === 'character') {
            const sortedChars = getSortedCharacters();
            if (sortedChars.length > 0) {
                currentCharacterFilter = sortedChars[0].name[currentLang];
                renderCharacterFilters();
                renderByCharacter(sortedChars[0].name[currentLang]);
            }
        }
    });
});

// ============================================
// 카드 생성
// ============================================
function createCharacterCard(char) {
    return `
        <div class="character-card" data-char-id="${characters.indexOf(char)}">
            <div class="card-image-wrapper">
                <img class="card-image" src="${char.image}" alt="${char.name[currentLang]}">
                <div class="card-attribute-badge">
                    <img src="${attributeIcons[char.attribute]}" alt="${char.attribute}">
                </div>
            </div>
            <div class="card-content">
                <div class="card-theme">${char.theme[currentLang]}</div>
                <h3 class="card-name">${char.name[currentLang]}</h3>
            </div>
        </div>
    `;
}

// ============================================
// 모달
// ============================================
function openModal(charIndex) {
    const char = characters[charIndex];
    
    document.getElementById('modal-image').src = char.detailImage;
    document.getElementById('modal-name').textContent = char.name[currentLang];
    document.getElementById('modal-attribute').src = attributeIcons[char.attribute];
    document.getElementById('modal-theme').textContent = char.theme[currentLang];
    document.getElementById('modal-skill-name').textContent = char.skillName[currentLang];
    
    let skillDesc = char.skillDesc[currentLang];
    
    // 속성 이름을 아이콘으로 치환
    const icons = {
        red: attributeIcons.red,
        yellow: attributeIcons.yellow,
        green: attributeIcons.green,
        sky: attributeIcons.sky,
        purple: attributeIcons.purple
    };
    
    if (currentLang === 'ko') {
        skillDesc = skillDesc
            .replace(/빨강/g, `<img class="skill-attribute-icon" src="${icons.red}">`)
            .replace(/노랑/g, `<img class="skill-attribute-icon" src="${icons.yellow}">`)
            .replace(/초록/g, `<img class="skill-attribute-icon" src="${icons.green}">`)
            .replace(/하늘/g, `<img class="skill-attribute-icon" src="${icons.sky}">`)
            .replace(/보라/g, `<img class="skill-attribute-icon" src="${icons.purple}">`);
    } else if (currentLang === 'ja') {
        skillDesc = skillDesc
            .replace(/赤/g, `<img class="skill-attribute-icon" src="${icons.red}">`)
            .replace(/黄色/g, `<img class="skill-attribute-icon" src="${icons.yellow}">`)
            .replace(/緑/g, `<img class="skill-attribute-icon" src="${icons.green}">`)
            .replace(/空色/g, `<img class="skill-attribute-icon" src="${icons.sky}">`)
            .replace(/紫/g, `<img class="skill-attribute-icon" src="${icons.purple}">`);
    } else { // en
        skillDesc = skillDesc
            .replace(/\b(Red|red)\b/g, `<img class="skill-attribute-icon" src="${icons.red}">`)
            .replace(/\b(Yellow|yellow)\b/g, `<img class="skill-attribute-icon" src="${icons.yellow}">`)
            .replace(/\b(Green|green)\b/g, `<img class="skill-attribute-icon" src="${icons.green}">`)
            .replace(/\b(Sky|sky|Blue|blue)\b/g, `<img class="skill-attribute-icon" src="${icons.sky}">`)
            .replace(/\b(Purple|purple)\b/g, `<img class="skill-attribute-icon" src="${icons.purple}">`);
    }
    
    document.getElementById('modal-skill-desc').innerHTML = skillDesc;
    modal.classList.add('show');
}

document.getElementById('modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// ============================================
// 전체 렌더링
// ============================================
function renderAllCharacters() {
    const container = document.getElementById('all-cards');
    container.innerHTML = characters.map(char => createCharacterCard(char)).join('');
    
    container.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const charId = parseInt(card.getAttribute('data-char-id'));
            openModal(charId);
        });
    });
}

// ============================================
// 속성별
// ============================================
function renderAttributeFilters() {
    const container = document.getElementById('attribute-filters');
    const attributes = ['red', 'yellow', 'green', 'sky', 'purple'];
    
    container.innerHTML = attributes.map(attr => `
        <button class="filter-btn ${currentAttributeFilter === attr ? 'active' : ''}" data-attr="${attr}">
            <img src="${attributeIcons[attr]}" alt="${attr}">
        </button>
    `).join('');
    
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const attr = btn.getAttribute('data-attr');
            currentAttributeFilter = attr;
            renderAttributeFilters();
            renderByAttribute(attr);
        });
    });
}

function renderByAttribute(filter) {
    const container = document.getElementById('attribute-cards');
    const filtered = characters.filter(char => char.attribute === filter);
    
    container.innerHTML = filtered.map(char => createCharacterCard(char)).join('');
    
    container.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const charId = parseInt(card.getAttribute('data-char-id'));
            openModal(charId);
        });
    });
}

// ============================================
// 테마별
// ============================================
function getUniqueThemes() {
    const themes = new Set();
    characters.forEach(char => {
        themes.add(char.theme[currentLang]);
    });
    return Array.from(themes);
}

function renderThemeFilters() {
    const container = document.getElementById('theme-filters');
    const themes = getUniqueThemes();
    
    container.innerHTML = themes.map(theme => `
        <button class="filter-btn ${currentThemeFilter === theme ? 'active' : ''}" data-theme="${theme}">
            <span>${theme}</span>
        </button>
    `).join('');
    
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            currentThemeFilter = theme;
            renderThemeFilters();
            renderByTheme(theme);
        });
    });
}

function renderByTheme(filter) {
    const container = document.getElementById('theme-cards');
    const filtered = characters.filter(char => char.theme[currentLang] === filter);
    
    container.innerHTML = filtered.map(char => createCharacterCard(char)).join('');
    
    container.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const charId = parseInt(card.getAttribute('data-char-id'));
            openModal(charId);
        });
    });
}

// ============================================
// 캐릭터별
// ============================================
function getSortedCharacters() {
    const order = [
        { ja: '花園羽香里', ko: '하나조노 하카리', en: 'Hakari Hanazono' },
        { ja: '院田唐音', ko: '인다 카라네', en: 'Karane Inda' },
        { ja: '好本静', ko: '요시모토 시즈카', en: 'Shizuka Yoshimoto' },
        { ja: '栄逢凪乃', ko: '에이아이 나노', en: 'Nano Eiai' },
        { ja: '薬膳楠莉', ko: '야쿠젠 쿠스리', en: 'Kusuri Yakuzen' },
        { ja: '薬膳楠莉（18歳）', ko: '야쿠젠 쿠스리(18세)', en: 'Kusuri Yakuzen (18)' },
        { ja: '花園羽々里', ko: '하나조노 하하리', en: 'Hahari Hanazono' }
    ];
    
    return order.map(orderItem => {
        return characters.find(char => char.name[currentLang] === orderItem[currentLang]);
    }).filter(char => char !== undefined);
}

function renderCharacterFilters() {
    const container = document.getElementById('character-filters');
    const sorted = getSortedCharacters();
    
    container.innerHTML = sorted.map(char => `
        <button class="filter-btn ${currentCharacterFilter === char.name[currentLang] ? 'active' : ''}" data-char-name="${char.name[currentLang]}">
            <span>${char.name[currentLang]}</span>
        </button>
    `).join('');
    
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const charName = btn.getAttribute('data-char-name');
            currentCharacterFilter = charName;
            renderCharacterFilters();
            renderByCharacter(charName);
        });
    });
}

function renderByCharacter(filter) {
    const container = document.getElementById('character-cards-display');
    const filtered = characters.filter(char => char.name[currentLang] === filter);
    
    container.innerHTML = filtered.map(char => createCharacterCard(char)).join('');
    
    container.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            const charId = parseInt(card.getAttribute('data-char-id'));
            openModal(charId);
        });
    });
}

// ============================================
// 운세
// ============================================
document.getElementById('fortune-btn').addEventListener('click', () => {
    const charKeys = Object.keys(CHARS);
    const randomKey = charKeys[Math.floor(Math.random() * charKeys.length)];
    const charData = CHARS[randomKey];
    
    const randomChar = characters.find(c => c.name.ja === charData.name.ja);
    const randomFortune = charData.fortunes[Math.floor(Math.random() * charData.fortunes.length)];
    
    document.getElementById('fortune-img').src = randomChar.image;
    document.getElementById('fortune-name').textContent = randomChar.name[currentLang];
    document.getElementById('fortune-text').textContent = randomFortune[currentLang];
    
    const fortuneResult = document.getElementById('fortune-result');
    fortuneResult.classList.remove('show');
    setTimeout(() => fortuneResult.classList.add('show'), 50);
});

// ============================================
// 언어 전환
// ============================================
function updateLanguage(lang) {
    currentLang = lang;
    
    for (const [id, text] of Object.entries(translations[lang])) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
    
    renderAllCharacters();
    renderAttributeFilters();
    renderByAttribute(currentAttributeFilter);
    renderThemeFilters();
    renderByTheme(currentThemeFilter || getUniqueThemes()[0]);
    renderCharacterFilters();
    renderByCharacter(currentCharacterFilter || getSortedCharacters()[0].name[lang]);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        updateLanguage(btn.getAttribute('data-lang'));
    });
});

// ============================================
// 초기화
// ============================================
renderAllCharacters();
renderAttributeFilters();
renderByAttribute('red');
renderThemeFilters();
renderByTheme(getUniqueThemes()[0]);
renderCharacterFilters();
renderByCharacter(getSortedCharacters()[0].name[currentLang]);

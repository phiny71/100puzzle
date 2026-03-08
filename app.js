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
        'fortune-btn-text': '운세 보기',
        'required-pieces': '필요 피스 수 (Lv.5)',
        'nav-birthday': '생일',
        'birthday-title': '🎂 생일!',
        'birthday-list-title': '📅 다가오는 생일 목록',
        'birthday-today': '생일 축하해!',
    },
    en: {
        'main-title': '💖 100 Puzzle Encyclopedia 💖',
        'nav-all': 'All',
        'nav-attribute': 'By Attribute',
        'nav-theme': 'By Theme',
        'nav-character': 'By Character',
        'nav-fortune': 'Fortune',
        'fortune-btn-text': 'Get Fortune',
        'required-pieces': 'Required Pieces (Lv.5)',
        'nav-birthday': 'Birthday',
        'birthday-title': "🎂 Birthday",
        'birthday-list-title': '📅 Upcoming Birthdays',
        'birthday-today': 'Happy Birthday!',
    },
    ja: {
        'main-title': '💖 100パズ図鑑 💖',
        'nav-all': '全体',
        'nav-attribute': '属性別',
        'nav-theme': 'テーマ別',
        'nav-character': 'キャラクター別',
        'nav-fortune': '今日の運勢',
        'fortune-btn-text': '運勢を見る',
        'required-pieces': '必要ピース数 (Lv.5)',
        'nav-birthday': '誕生日',
        'birthday-title': '🎂 誕生日',
        'birthday-list-title': '📅 これからの誕生日リスト',
        'birthday-today': 'お誕生日おめでとう！',
    }
};

// ============================================
// 상태 (초기값 설정)
// ============================================
let currentLang;
let currentAttributeFilter = 'red';
let currentThemeFilter = ''; // 초기화 시 설정됨
let currentCharacterFilter = ''; // 초기화 시 설정됨

// ============================================
// 커서 애니메이션
// ============================================
const cursor = document.getElementById('cursor');
let cursorX = 0, cursorY = 0, currentX = 0, currentY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    currentX += (cursorX - currentX) * 0.3; // 부드러움 조절
    currentY += (cursorY - currentY) * 0.3;
    if(cursor) {
        cursor.style.left = currentX + 'px';
        cursor.style.top = currentY + 'px';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// 호버 효과 통합 관리
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, a, .character-card');
    cursor.classList.toggle('hover', !!target);
});

// ============================================
// 렌더링 통합 관리 (핵심 최적화)
// ============================================
function refreshCurrentSection() {
    const activeSection = document.querySelector('.section.active').id;
    
    // 공통 필터 버튼은 항상 갱신
    renderAttributeFilters();
    renderThemeFilters();
    renderCharacterFilters();

    // 현재 보고 있는 섹션만 실제 카드 렌더링
    if (activeSection === 'all') {
        renderAllCharacters();
    } else if (activeSection === 'attribute') {
        renderByAttribute(currentAttributeFilter);
    } else if (activeSection === 'theme') {
        renderByTheme(currentThemeFilter);
    } else if (activeSection === 'character') {
        renderByCharacter(currentCharacterFilter);
    }
}

// ============================================
// 생일 축하
// ============================================
function fireConfetti() {
    var end = Date.now() + (3 * 1000); // 3초 동안 실행

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            zIndex: 20001
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            zIndex: 20001
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function checkBirthdays() {
    // 1. 오늘 이미 팝업을 닫았는지 확인
    const closedDate = localStorage.getItem('birthday-popup-closed');
    const todayDate = new Date().toISOString().split('T')[0];
    
    if (closedDate === todayDate) {
        return; 
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const todayStr = `${month}-${date}`;

    const extraList = typeof additionalBirthdays !== 'undefined' ? additionalBirthdays : [];
    const birthdayList = extraList.filter(c => c.birthday === todayStr);

    if (birthdayList.length > 0) {
        const modal = document.getElementById('birthday-modal');
        const msg = document.getElementById('birthday-msg');
        const confirmBtn = document.querySelector('.birthday-confirm-btn');
        
        const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'ko';

        // 1. 이름 합치기 로직 (생략 없이 그대로 사용)
        const nameArray = birthdayList.map(c => c.name[lang] || c.name['ko']);
        let joinedNames = nameArray.length > 1 
            ? nameArray.slice(0, -1).join(', ') + (lang === 'ko' ? '와 ' : (lang === 'ja' ? 'と' : ' and ')) + nameArray.slice(-1)
            : nameArray[0];

        // 2. 이미지 HTML 생성
        let imageHtml = '<div class="birthday-images-container" style="display: flex; justify-content: center; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 40px; width: 100%;">';

        birthdayList.forEach(char => {
          if (char.image) {
        // 이미지가 2명일 때 가로로 나오게 하려면 높이를 300~400px 정도로 조절하는 게 좋습니다.
        imageHtml += `
            <img src="${char.image}" 
                 style="width: auto !important; 
                        height: 350px !important; 
                        max-width: 80% !important; 
                        border-radius: 10px !important; 
                        object-fit: contain !important;">`;
    }
});

imageHtml += '</div>';

        // 3. 메시지 설정 (문장 전체)
        const wishes = {
            ko: `오늘은 ${joinedNames}의 생일입니다! 🎂`,
            en: `Today is ${joinedNames}'s Birthday! 🎂`,
            ja: `今日は ${joinedNames}の誕生日です！ 🎂`
        };

        // 4. 화면에 뿌리기 (이미지 + 메시지)
        if (msg) {
            msg.innerHTML = `${imageHtml}<div>${wishes[lang]}</div>`;
        }

        // 버튼 라벨 설정
        const btnLabels = { ko: "축하해!", en: "Congrats!", ja: "おめでとう！" };
        if (confirmBtn) confirmBtn.textContent = btnLabels[lang];

        if (modal) {
            modal.style.display = 'flex';
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 20001 });
        }
    }
}

function closeBirthdayModal() {
    const modal = document.getElementById('birthday-modal');
    if (modal) {
        modal.style.display = 'none';
        
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('birthday-popup-closed', today);
    }
}

// ============================================
// 내비게이션
// ============================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetSection = btn.getAttribute('data-section');
        
        // UI 전환
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        window.scrollTo(0, 0);
        if (targetSection === 'birthday') {
            updateBirthdayTab(); 
        }

        // 섹션별 초기 필터값 세팅 및 렌더링
        if (targetSection === 'theme' && !currentThemeFilter) {
            currentThemeFilter = getUniqueThemes()[0];
        }
        if (targetSection === 'character' && !currentCharacterFilter) {
            const sorted = getSortedCharacters();
            if(sorted.length > 0) currentCharacterFilter = sorted[0].name[currentLang];
        }
        
        refreshCurrentSection();
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
    
    // 필요 피스 수 표시
    document.getElementById('modal-required-label').textContent = translations[currentLang]['required-pieces'];
    document.getElementById('modal-required-value').textContent = char.requiredPieces;
    
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
// 생일 탭
// ============================================
function updateBirthdayTab() {
    const display = document.getElementById('birthday-countdown-container');
    if (!display) return;

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ko';
    const t = translations[lang];

    // 언어별 축하 메시지 설정 (이 문구만 강조됩니다)
    const messages = {
        ko: "🎉 생일을 진심으로 축하합니다! 🎉",
        en: "🎉 Happy Birthday! Have a wonderful day! 🎉",
        ja: "🎉 お誕生日おめでとうございます！ 🎉"
    };
    const birthdayMsg = messages[lang] || messages['ko'];

    const list = typeof additionalBirthdays !== 'undefined' ? additionalBirthdays : [];
    if (list.length === 0) return;

// 생일 날짜가 "00-00" 형식인 멤버들만 걸러내기 (TBD 멤버 자동 제외)
    const validList = list.filter(char => char.birthday && /^\d{2}-\d{2}$/.test(char.birthday));
    // --------------------------

    // 1. D-Day 계산 로직
    const sorted = list.map(char => {
        const today = new Date();
        const [m, d] = char.birthday.split('-').map(Number);
        let target = new Date(today.getFullYear(), m - 1, d);
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        if (target < todayMidnight) target.setFullYear(today.getFullYear() + 1);
        const diff = Math.ceil((target - todayMidnight) / (1000 * 60 * 60 * 24));
        return { ...char, dDay: diff };
    }).sort((a, b) => a.dDay - b.dDay);

    const minDDay = sorted[0].dDay;
    const heroes = sorted.filter(c => c.dDay === minDDay);
    const upcoming = sorted.filter(c => c.dDay > minDDay).slice(0, 4);

    // 2. 화면 렌더링
    display.innerHTML = `
        <div style="display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; justify-content: center; align-items: flex-start; gap: 60px; padding: 60px 20px; width: 100%; max-width: 1400px; margin: 0 auto; box-sizing: border-box;">
            
            <div style="flex: 1.2; text-align: center; min-width: 0;">
                <h2 style="margin-bottom:40px; font-size: 2.2rem; color:#333;">${t['birthday-title']}</h2>
                <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-end; gap: 20px; flex-wrap: wrap;">
                    ${heroes.map(h => `
                        <div style="text-align: center;">
                            <img src="${h.image}" style="height: 380px; width: auto; object-fit: contain; border-radius: 20px; filter: drop-shadow(0 15px 20px rgba(0,0,0,0.15));">
                            <div style="font-size: 1.8rem; font-weight: bold; margin-top: 15px; color: #222;">${h.name[lang] || h.name['ko']}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="display: inline-block; margin-top: 35px; background: #ff6b6b; color: white; padding: 18px 45px; border-radius: 50px; box-shadow: 0 10px 25px rgba(255,107,107,0.4);">
                    <div style="font-size: 1.5rem; font-weight: bold; line-height: 1.2;">
                        ${minDDay === 0 ? birthdayMsg : 'D-' + minDDay}
                    </div>
                </div>
            </div>

            <div style="width: 450px; flex-shrink: 0; background: #fff; border: 1px solid #eee; padding: 35px; border-radius: 30px; box-shadow: 0 15px 40px rgba(0,0,0,0.05); margin-top: 50px;">
                <h3 style="margin-bottom:25px; color:#ff6b6b; font-size: 1.6rem; border-bottom: 2px solid #ffb6c1; padding-bottom: 15px; text-align: left;">
                    ${t['birthday-list-title']}
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #fff5f5; color: #aaa; font-size: 0.9rem;">
                            <th style="padding: 10px 0; text-align: left; font-weight: normal;">Profile</th>
                            <th style="padding: 10px 10px; text-align: left; font-weight: normal;">Name</th>
                            <th style="padding: 10px 10px; text-align: center; font-weight: normal;">Date</th>
                            <th style="padding: 10px 0; text-align: right; font-weight: normal;">D-Day</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${upcoming.map(c => `
    <tr style="border-bottom: 1px solid #f9f9f9;">
        <td style="padding: 15px 0;"> 
            <div style="width: 80px; height: 80px; overflow: hidden; border-radius: 15px; background: #fff5f5; border: 1px solid #ffe0e0;">
                <img src="${c.image}" style="
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                    transform: scale(1.15); /* 이미지를 1.1배 더 확대해서 칸에 밀착 */
                    display: block;
                ">
            </div>
        </td>
        <td style="padding: 20px 10px; font-weight: 600; font-size: 1.2rem; text-align: left;">
            ${c.name[lang] || c.name['ko']}
        </td>
        <td style="padding: 20px 10px; text-align: center; color: #888; font-size: 1.1rem;">
            ${c.birthday}
        </td>
        <td style="padding: 20px 0; color: #ff6b6b; font-weight: bold; text-align: right; font-size: 1.2rem;">
            D-${c.dDay}
        </td>
    </tr>
`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ============================================
// 운세
// ============================================
document.getElementById('fortune-btn').addEventListener('click', () => {
    // 전체 캐릭터 중에서 무작위로 선택
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    // CHARS 객체에서 해당 캐릭터 찾기
    // 쿠스리(18세)는 별도로 처리
    let charKey;
    if (randomChar.name.ja === '薬膳楠莉（18歳）') {
        charKey = 'kusuri18';
    } else {
        // 괄호 제거한 기본 이름으로 찾기
        const baseName = randomChar.name.ja.replace(/（.*?）/g, '');
        charKey = Object.keys(CHARS).find(key => CHARS[key].name.ja === baseName);
    }
    
    const charData = CHARS[charKey];

// === 예외 처리 시작 ===
    if (!charData || !charData.fortunes) { // ⬅️ 데이터가 없으면 실행 중단
        console.error("운세 데이터를 찾을 수 없습니다:", baseName);
        alert("운세를 가져오는 중 오류가 발생했습니다.");
        return; 
    }
    // === 예외 처리 끝 ===
    
    // 해당 캐릭터의 운세 중 무작위로 선택
    const randomFortune = charData.fortunes[Math.floor(Math.random() * charData.fortunes.length)];
    
    // 카드 이미지 (메인 이미지 사용)
    document.getElementById('fortune-img').src = randomChar.image;
    
    // 캐릭터 이름
    document.getElementById('fortune-name').textContent = randomChar.name[currentLang];
    
    // 운세 문구
    document.getElementById('fortune-text').textContent = randomFortune[currentLang];
    
    // 결과 표시 (애니메이션)
    const fortuneResult = document.getElementById('fortune-result');
    fortuneResult.classList.remove('show');
    setTimeout(() => fortuneResult.classList.add('show'), 50);
});

// ============================================
// 언어 전환
// ============================================
function updateLanguage(lang) {
    currentLang = lang;
    
    // 1. 번역 텍스트 적용
    for (const [id, text] of Object.entries(translations[lang])) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }
    
    // 2. 언어 버튼 상태 변경
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 3. 필터 변수값도 해당 언어로 동기화
    const themes = getUniqueThemes();
    if (!themes.includes(currentThemeFilter)) currentThemeFilter = themes[0];

    const sorted = getSortedCharacters();
    const charExists = sorted.some(c => c.name[currentLang] === currentCharacterFilter);
    
    if (!charExists && sorted.length > 0) currentCharacterFilter = sorted[0].name[currentLang];
    const birthdaySection = document.getElementById('birthday');
    if (birthdaySection && birthdaySection.classList.contains('active')) {
        updateBirthdayTab();
    }
    // 4. 현재 화면 새로고침
    refreshCurrentSection();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => updateLanguage(btn.getAttribute('data-lang')));
});

// 1. 초기 언어 선택 함수
function selectInitialLang(lang) {
    currentLang = lang; // 전역 변수에 언어 저장
    updateLanguage(lang); // 화면 번역 및 데이터 렌더링
    
    const overlay = document.getElementById('language-overlay');
    if (overlay) {
        overlay.style.opacity = '0'; // 서서히 사라지는 효과
        setTimeout(() => {
            overlay.style.display = 'none'; // 완전히 제거
            checkBirthdays(); 
        }, 500);
    }
    
    localStorage.setItem('user-lang', lang); // 선택 기억하기
}

// 2. 파일의 가장 밑바닥: 초기화 실행
function init() {
    const savedLang = localStorage.getItem('user-lang');
    const overlay = document.getElementById('language-overlay');

    if (savedLang) {
        // 이미 선택한 적이 있다면 바로 도감 보여주기
        if (overlay) overlay.style.display = 'none';
        updateLanguage(savedLang);
    } else {
        // 처음이라면 오버레이를 띄우고 대기
        if (overlay) overlay.style.display = 'flex';
    }
}

init();

// ============================================
// 초기화 실행 로직
// ============================================
function init() {
    const savedLang = localStorage.getItem('user-lang');
    const overlay = document.getElementById('language-overlay');

    if (savedLang) {
        // 이미 언어가 저장되어 있다면: 
        // 오버레이는 CSS에서 이미 none이므로 건드릴 필요 없음
        updateLanguage(savedLang);
        checkBirthdays(); 
    } else {
        // 처음 방문했다면: 
        // 그때 비로소 오버레이를 화면에 표시
        if (overlay) overlay.style.display = 'flex';
        
        // (선택 사항) 선택 전까지 뒤의 배경이 하얗게 비어있는 게 싫다면 
        // 임시로 한국어라도 렌더링해둘 수 있습니다.
        // updateLanguage('ko'); 
    }
}

// 최종 실행
init();

// 페이지 로드 후 실행
document.addEventListener("DOMContentLoaded", () => {
    // 요소 가져오기
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // [기능 1] 스크롤 시 헤더 변경
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // [기능 2] 현재 섹션 메뉴 강조
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // 감지 영역 설정
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 섹션이 감지 영역에 들어올 때
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                
                // 해당 메뉴만 강조
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // 모든 섹션 감시 시작
    sections.forEach(section => {
        observer.observe(section);
    });
});
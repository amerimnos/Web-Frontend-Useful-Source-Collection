// 스크롤바 너비를 가져오는 함수
function getScrollbarWidth() {
    // 스크롤바 너비를 측정하기 위해 div 요소를 생성
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflowY = 'scroll';
    div.style.visibility = 'hidden';

    // div 요소를 페이지 본문에 추가
    document.body.appendChild(div);

    // 스크롤바 너비를 계산
    const scrollbarWidth = div.offsetWidth - div.clientWidth;

    // div 요소를 페이지 본문에서 제거
    document.body.removeChild(div);

    // 스크롤바 너비 반환
    return scrollbarWidth;
}

// 창이 로드될 때 스크롤바 너비 CSS 변수를 설정하는 이벤트 리스너
window.addEventListener('load', () => {
    try {
        // 스크롤바 너비 가져오기
        const scrollbarWidth = getScrollbarWidth();

        // --user-scroll-bar-width CSS 변수를 스크롤바 너비로 설정
        document.documentElement.style.setProperty('--user-scroll-bar-width', `${scrollbarWidth}px`);
    } catch (error) {
        console.error('스크롤바 너비 설정 중 오류 발생:', error);
    }
});
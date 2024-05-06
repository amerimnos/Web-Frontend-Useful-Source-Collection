
const $comboBox = document.querySelectorAll('.c-combobox');

window.addEventListener('DOMContentLoaded', () => {
    $comboBox.forEach(el => setComboBox(el));
});

function setComboBox(el) {
    let comboEl = el.querySelector('[role=combobox]');
    let labelEl = el.querySelector('.c-combobox__label');
    let listboxEl = el.querySelector('[role=listbox]');
    let optionEls = el.querySelectorAll('[role=option]');
    let idBase = comboEl.id || 'combo';
    let activeIndex = 0;
    let isOpen = false;
    let searchString = '';
    let searchTimeout = null;
    let selectActions = {
        Close: 0,
        CloseSelect: 1,
        First: 2,
        Last: 3,
        Next: 4,
        Open: 5,
        PageDown: 6,
        PageUp: 7,
        Previous: 8,
        Select: 9,
        Type: 10,
    };
    let options = [];
    let optionsForSearch = [];

    if (el && comboEl && listboxEl) init();

    function init() {
        labelEl.addEventListener('click', onLabelClick);
        comboEl.addEventListener('blur', onComboBlur);
        listboxEl.addEventListener('focusout', onComboBlur);
        comboEl.addEventListener('click', onComboClick);
        comboEl.addEventListener('keydown', onComboKeyDown);

        getComboboxOptionsText();

        optionEls.forEach((element, index) => {
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                onOptionClick(index);
            });
        });
    }

    function getComboboxOptionsText() {
        optionEls.forEach(option => {
            options.push(option.textContent);
            optionsForSearch.push(decomposeHangulToEng(option.textContent));
        });
    }

    /**
     * @description 키보드로 한글 검색을 위해
     */
    function decomposeHangulToEng(textContent) {
        // 초성, 중성, 종성 문자열 정의
        const initialConsonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const medialVowels = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        const finalConsonants = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

        // 영문 변환 문자열 정의
        const changeInitialConsonantsToEng = ['r', 'R', 's', 'e', 'E', 'f', 'a', 'q', 'Q', 't', 'T', 'd', 'w', 'W', 'c', 'z', 'x', 'v', 'g'];
        const changeMedialVowelsToEng = ['k', 'o', 'i', 'O', 'j', 'p', 'u', 'P', 'h', 'hk', 'ho', 'hl', 'y', 'n', 'nj', 'np', 'nl', 'b', 'm', 'ml', 'l'];
        const changeFinalConsonantsToEng = ['', 'r', 'R', 'rt', 's', 'sw', 'sg', 'e', 'f', 'fr', 'fa', 'fq', 'ft', 'fx', 'fv', 'fg', 'a', 'q', 'qt', 't', 'T', 'd', 'w', 'c', 'z', 'x', 'v', 'g'];

        let result = '';

        for (let i = 0; i < textContent.length; i++) {
            const charCode = textContent.charCodeAt(i);

            if (isHangulCharacter(charCode)) {
                const unicode = charCode - 0xAC00;
                const initial = Math.floor(unicode / (21 * 28));
                const medial = Math.floor((unicode % (21 * 28)) / 28);
                const final = unicode % 28;

                result += changeInitialConsonantsToEng[initialConsonants.indexOf(initialConsonants[initial])];
                result += changeMedialVowelsToEng[medialVowels.indexOf(medialVowels[medial])];
                result += changeFinalConsonantsToEng[finalConsonants.indexOf(finalConsonants[final])];
            } else {
                result += textContent[i] + '';
            }
        }

        return result.trim();
    }

    function isHangulCharacter(charCode) {
        return charCode >= 0xAC00 && charCode <= 0xD7A3;
    }

    function getSearchString(char) {
        const SEARCH_TIMEOUT_DURATION = 500;
        if (typeof searchTimeout === 'number') {
            window.clearTimeout(searchTimeout);
        }

        searchTimeout = window.setTimeout(() => {
            searchString = '';
        }, SEARCH_TIMEOUT_DURATION);

        searchString += char;
        return searchString;
    }

    function onLabelClick() {
        comboEl.focus();
    }

    function onComboBlur(event) {
        if (listboxEl.contains(event.relatedTarget)) {
            return;
        }

        if (isOpen) {
            selectOption(activeIndex);
            updateMenuState(false, false);
        }
    }

    function onComboClick() {
        updateMenuState(!isOpen, false);
    }

    function onComboKeyDown(event) {
        const { key } = event;
        const max = options.length - 1;

        const action = getActionFromKey(event, isOpen);

        switch (action) {
            case selectActions.Last:
            case selectActions.First:
                updateMenuState(true);
            // intentional fallthrough
            case selectActions.Next:
            case selectActions.Previous:
            case selectActions.PageUp:
            case selectActions.PageDown:
                event.preventDefault();
                return onOptionChange(
                    getUpdatedIndex(activeIndex, max, action)
                );
            case selectActions.CloseSelect:
                event.preventDefault();
                selectOption(activeIndex);
            // intentional fallthrough
            case selectActions.Close:
                event.preventDefault();
                return updateMenuState(false);
            case selectActions.Type:
                return onComboType(key);
            case selectActions.Open:
                event.preventDefault();
                return updateMenuState(true);
        }
    }

    function onComboType(letter) {
        updateMenuState(true);

        searchString = getSearchString(letter);
        const searchIndex = getIndexByLetter(
            optionsForSearch,
            searchString,
            activeIndex + 1
        );
        // console.log('searchIndex : ' + searchIndex);

        if (searchIndex >= 0) {
            onOptionChange(searchIndex);
        } else {
            window.clearTimeout(searchTimeout);
            searchString = '';
        }
    }

    function onOptionChange(index) {
        activeIndex = index;
        comboEl.setAttribute('aria-activedescendant', `${idBase}-${index}`);

        [...optionEls].forEach((optionEl) => {
            optionEl.classList.remove('c-combobox__option--current');
        });
        optionEls[index].classList.add('c-combobox__option--current');

        if (isScrollable(listboxEl)) {
            maintainScrollVisibility(optionEls[index], listboxEl);
        }

        if (!isElementInView(optionEls[index])) {
            optionEls[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function onOptionClick(index) {
        onOptionChange(index);
        selectOption(index);
        updateMenuState(false);
    }

    function selectOption(index) {
        activeIndex = index;
        const selected = options[index];
        comboEl.innerHTML = selected;

        [...optionEls].forEach((optionEl) => {
            optionEl.setAttribute('aria-selected', 'false');
        });
        optionEls[index].setAttribute('aria-selected', 'true');
    }

    function updateMenuState(open, callFocus = true) {
        if (isOpen === open) {
            return;
        }
        isOpen = open;

        comboEl.setAttribute('aria-expanded', `${isOpen}`);
        isOpen ? el.classList.add('on') : el.classList.remove('on');

        const activeID = isOpen ? `${idBase}-${activeIndex}` : '';
        comboEl.setAttribute('aria-activedescendant', activeID);

        if (activeID === '' && !isElementInView(comboEl)) {
            comboEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        callFocus && comboEl.focus();
    }

    function filterOptions(options = [], filter) {
        return options.filter(option => {
            return option.toLowerCase().indexOf(filter.toLowerCase()) === 0
        });
    }

    function getActionFromKey(event, menuOpen) {
        const { key, altKey, ctrlKey, metaKey } = event;
        const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
        if (!menuOpen && openKeys.includes(key)) return selectActions.Open;
        if (key === 'Home') return selectActions.First;
        if (key === 'End') return selectActions.Last;
        if (key === 'Backspace' || key === 'Clear' || (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)) return selectActions.Type;
        if (menuOpen) {
            if (key === 'ArrowUp' && altKey) return selectActions.CloseSelect;
            if (key === 'ArrowDown' && !altKey) return selectActions.Next;
            if (key === 'ArrowUp') return selectActions.Previous;
            if (key === 'PageUp') return selectActions.PageUp;
            if (key === 'PageDown') return selectActions.PageDown;
            if (key === 'Escape') return selectActions.Close;
            if (key === 'Enter' || key === ' ') return selectActions.CloseSelect;
        }
    }

    function getIndexByLetter(optionsForSearch, filter, startIndex = 0) {
        const orderedOptions = [...optionsForSearch.slice(startIndex), ...optionsForSearch.slice(0, startIndex)];
        const firstMatch = filterOptions(orderedOptions, filter)[0];
        const allSameLetter = array => array.every(letter => letter === array[0]);

        if (firstMatch) return optionsForSearch.indexOf(firstMatch); // 검색시 초기 이니셜 있을 경우

        // TODO gt.yang : 왜 필요할지 확인 필요(현재 로직상 없어도 무방).
        // if (allSameLetter(filter.split(''))) { // 검색시 초기 이니셜이 없을 경우,
        //     // console.log('asdasd : ' + options.indexOf(filterOptions(orderedOptions, filter[0])[0]));
        //     return options.indexOf(filterOptions(orderedOptions, filter[0])[0]);
        // }
        return -1;
    }

    function getUpdatedIndex(currentIndex, maxIndex, action) {
        const pageSize = 10;
        switch (action) {
            case selectActions.First: return 0;
            case selectActions.Last: return maxIndex;
            case selectActions.Previous: return Math.max(0, currentIndex - 1);
            case selectActions.Next: return Math.min(maxIndex, currentIndex + 1);
            case selectActions.PageUp: return Math.max(0, currentIndex - pageSize);
            case selectActions.PageDown: return Math.min(maxIndex, currentIndex + pageSize);
            default: return currentIndex;
        }
    }

    function isElementInView(element) {
        const bounding = element.getBoundingClientRect();
        return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function isScrollable(element) {
        return element && element.clientHeight < element.scrollHeight;
    }

    function maintainScrollVisibility(activeElement, scrollParent) {
        const { offsetHeight, offsetTop } = activeElement;
        const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;
        const isAbove = offsetTop < scrollTop;
        const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;
        // console.log('offsetTop + offsetHeight : ' + (offsetTop + offsetHeight) + ' scrollTop + parentOffsetHeight : ' + (scrollTop + parentOffsetHeight));
        if (isAbove) scrollParent.scrollTo(0, offsetTop);
        else if (isBelow) scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
    }
}
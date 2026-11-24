document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("main-header");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const article = document.querySelector(".wiki-article");

    // 스크롤 시 헤더 그림자 강조
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("scrolled", window.scrollY > 30);
        });
    }

    // 검색 결과 표시 해제
    function clearMarks() {
        if (!article) return;
        article.querySelectorAll("mark.search-mark").forEach((m) => {
            const p = m.parentNode;
            p.replaceChild(document.createTextNode(m.textContent), m);
            p.normalize();
        });
    }

    // 문서 내 검색
    function runSearch(query) {
        clearMarks();
        const q = query.trim();
        if (!q || !article) return;

        const lower = q.toLowerCase();
        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const tag = node.parentElement ? node.parentElement.tagName : "";
                if (["SCRIPT", "STYLE", "MARK", "INPUT", "BUTTON"].includes(tag)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return node.nodeValue.toLowerCase().includes(lower)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "gi");
        let first = null;

        nodes.forEach((textNode) => {
            const val = textNode.nodeValue;
            const frag = document.createDocumentFragment();
            let last = 0;
            val.replace(regex, (match, _g1, offset) => {
                if (offset > last) frag.appendChild(document.createTextNode(val.slice(last, offset)));
                const mark = document.createElement("mark");
                mark.className = "search-mark";
                mark.textContent = match;
                if (!first) first = mark;
                frag.appendChild(mark);
                last = offset + match.length;
                return match;
            });
            if (last < val.length) frag.appendChild(document.createTextNode(val.slice(last)));
            textNode.parentNode.replaceChild(frag, textNode);
        });

        if (first) {
            article.querySelectorAll("mark.search-mark").forEach(revealFoldedContent);
            first.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            runSearch(searchInput.value);
        });
    }

    // 검색창 밖의 다른 화면을 클릭하면 검색 색 처리 해제
    document.addEventListener("click", (e) => {
        if (searchForm && searchForm.contains(e.target)) return;
        clearMarks();
    });
});

// 목차 및 문단 접기·펼치기
function setFold(button, expanded) {
    const body = document.getElementById(button.getAttribute("aria-controls"));
    if (!body) return;
    body.hidden = !expanded;
    button.textContent = expanded ? "[접기]" : "[펼치기]";
    button.setAttribute("aria-expanded", String(expanded));
}

function revealFoldedContent(target) {
    for (let el = target; el; el = el.parentElement) {
        if (el.hidden && el.id) {
            const button = Array.from(document.querySelectorAll(".fold-btn, .toc-toggle"))
                .find(btn => btn.getAttribute("aria-controls") === el.id);
            if (button) setFold(button, true);
        }
    }
    if (target.matches("section")) {
        const button = target.querySelector(":scope > h2 > .fold-btn, :scope > h3 > .fold-btn");
        if (button) setFold(button, true);
    }
}

document.querySelectorAll(".fold-btn, .toc-toggle").forEach(button => {
    button.addEventListener("click", () => setFold(button, button.getAttribute("aria-expanded") !== "true"));
});

// 목차 이동 시 접힌 상위 문단과 해당 문단을 자동으로 펼침
function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target) { revealFoldedContent(target); target.scrollIntoView(); }
}
document.querySelectorAll('.toc a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => {
        const target = document.getElementById(link.hash.slice(1));
        if (target) revealFoldedContent(target);
    });
});
window.addEventListener("hashchange", revealHash);
if (location.hash) revealHash();

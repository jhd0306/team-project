const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const article = document.querySelector(".wiki-article");

// 이전 검색 표시 지우기
function clearMarks() {
  article.querySelectorAll("mark.search-mark").forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  article.normalize(); // 쪼개진 텍스트 노드 다시 합치기
}

// 검색어가 들어간 텍스트를 <mark>로 감싸기
function highlight(keyword) {
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const targets = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("button, script, style, .toc")) continue;
    if (node.nodeValue.toLowerCase().includes(keyword.toLowerCase())) {
      targets.push(node);
    }
  }

  const regex = new RegExp(
    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );

  targets.forEach((node) => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;

    text.replace(regex, (match, offset) => {
      frag.append(document.createTextNode(text.slice(last, offset)));
      const mark = document.createElement("mark");
      mark.className = "search-mark";
      mark.textContent = match;
      frag.append(mark);
      last = offset + match.length;
    });

    frag.append(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearMarks();

  const keyword = input.value.trim();
  if (!keyword) return;

  highlight(keyword);

  const first = article.querySelector("mark.search-mark");
  if (first) {
    article.querySelectorAll("mark.search-mark").forEach(revealFoldedContent);
    first.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert("검색 결과가 없습니다.");
  }
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
    if (target.matches("section, .section-toggle-card")) {
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

// 기존 헤더 스크롤 효과 유지
const mainHeader = document.querySelector("#main-header");
if (mainHeader) {
    window.addEventListener("scroll", () => mainHeader.classList.toggle("scrolled", window.scrollY > 30));
}

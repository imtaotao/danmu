try{(()=>{function i(e){if(!e)return;let r=e.getAttribute("tabindex")!==null,t=e.scrollWidth>e.clientWidth;t&&!r?e.setAttribute("tabindex","0"):!t&&r&&e.removeAttribute("tabindex")}function a(e){let r=new Set,t;return new ResizeObserver(u=>{u.forEach(o=>r.add(o.target)),t&&clearTimeout(t),t=setTimeout(()=>{t=void 0,r.forEach(o=>e(o)),r.clear()},250)})}function s(e,r){e.querySelectorAll?.(".expressive-code pre > code").forEach(t=>{let n=t.parentElement;n&&(i(n),r.observe(n))})}var d=a(i);s(document,d);var c=new MutationObserver(e=>e.forEach(r=>r.addedNodes.forEach(t=>{s(t,d)})));c.observe(document.body,{childList:!0,subtree:!0});document.addEventListener("astro:page-load",()=>{s(document,d)});})();}catch(e){console.error("[EC] tabindex-js-module failed:",e)}
try{(()=>{function i(o){let e=document.createElement("pre");Object.assign(e.style,{opacity:"0",pointerEvents:"none",position:"absolute",overflow:"hidden",left:"0",top:"0",width:"20px",height:"20px",webkitUserSelect:"auto",userSelect:"all"}),e.ariaHidden="true",e.textContent=o,document.body.appendChild(e);let a=document.createRange();a.selectNode(e);let n=getSelection();if(!n)return!1;n.removeAllRanges(),n.addRange(a);let r=!1;try{r=document.execCommand("copy")}finally{n.removeAllRanges(),document.body.removeChild(e)}return r}async function l(o){let e=o.currentTarget,a=e.dataset,n=!1,r=a.code.replace(/\u007f/g,`
`);try{await navigator.clipboard.writeText(r),n=!0}catch{n=i(r)}if(!n||e.parentNode?.querySelector(".feedback"))return;let t=document.createElement("div");t.classList.add("feedback"),t.append(a.copied),e.before(t),t.offsetWidth,requestAnimationFrame(()=>t?.classList.add("show"));let c=()=>!t||t.classList.remove("show"),d=()=>{!t||parseFloat(getComputedStyle(t).opacity)>0||(t.remove(),t=void 0)};setTimeout(c,1500),setTimeout(d,2500),e.addEventListener("blur",c),t.addEventListener("transitioncancel",d),t.addEventListener("transitionend",d)}function s(o){o.querySelectorAll?.(".expressive-code .copy button").forEach(e=>e.addEventListener("click",l))}s(document);var u=new MutationObserver(o=>o.forEach(e=>e.addedNodes.forEach(a=>{s(a)})));u.observe(document.body,{childList:!0,subtree:!0});document.addEventListener("astro:page-load",()=>{s(document)});})();}catch(e){console.error("[EC] copy-js-module failed:",e)}
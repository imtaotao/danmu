const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/ui-core.C8n07GXw.js","_astro/Tabs.astro_astro_type_script_index_0_lang.CCIyraCc.js"])))=>i.map(i=>d[i]);
import"./Tabs.astro_astro_type_script_index_0_lang.CCIyraCc.js";const w="modulepreload",L=function(o){return"/danmu/document/"+o},E={},T=function(e,r,s){let d=Promise.resolve();if(r&&r.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),i=a?.nonce||a?.getAttribute("nonce");d=Promise.all(r.map(c=>{if(c=L(c),c in E)return;E[c]=!0;const u=c.endsWith(".css"),g=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${g}`))return;const t=document.createElement("link");if(t.rel=u?"stylesheet":w,u||(t.as="script",t.crossOrigin=""),t.href=c,i&&t.setAttribute("nonce",i),document.head.appendChild(t),u)return new Promise((l,n)=>{t.addEventListener("load",l),t.addEventListener("error",()=>n(new Error(`Unable to preload CSS for ${c}`)))})}))}return d.then(()=>e()).catch(a=>{const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=a,window.dispatchEvent(i),!i.defaultPrevented)throw a})};class k extends HTMLElement{constructor(){super();const e=this.querySelector("button[data-open-modal]"),r=this.querySelector("button[data-close-modal]"),s=this.querySelector("dialog"),d=this.querySelector(".dialog-frame"),a=n=>{("href"in(n.target||{})||document.body.contains(n.target)&&!d.contains(n.target))&&c()},i=n=>{s.showModal(),document.body.toggleAttribute("data-search-modal-open",!0),this.querySelector("input")?.focus(),n?.stopPropagation(),window.addEventListener("click",a)},c=()=>s.close();e.addEventListener("click",i),e.disabled=!1,r.addEventListener("click",c),s.addEventListener("close",()=>{document.body.toggleAttribute("data-search-modal-open",!1),window.removeEventListener("click",a)}),window.addEventListener("keydown",n=>{(n.metaKey===!0||n.ctrlKey===!0)&&n.key==="k"&&(s.open?c():i(),n.preventDefault())});let u={};try{u=JSON.parse(this.dataset.translations||"{}")}catch{}const l=this.dataset.stripTrailingSlash!==void 0?n=>n.replace(/(.)\/(#.*)?$/,"$1$2"):n=>n;window.addEventListener("DOMContentLoaded",()=>{(window.requestIdleCallback||(m=>setTimeout(m,1)))(async()=>{const{PagefindUI:m}=await T(async()=>{const{PagefindUI:h}=await import("./ui-core.C8n07GXw.js");return{PagefindUI:h}},__vite__mapDeps([0,1]));new m({element:"#starlight__search",baseUrl:"/danmu/document",bundlePath:"/danmu/document".replace(/\/$/,"")+"/pagefind/",showImages:!1,translations:u,showSubResults:!0,processResult:h=>{h.url=l(h.url),h.sub_results=h.sub_results.map(f=>(f.url=l(f.url),f))}})})})}}customElements.define("site-search",k);const S="starlight-theme";function y(o){return o==="auto"||o==="dark"||o==="light"?o:"auto"}function b(){return y(typeof localStorage<"u"&&localStorage.getItem(S))}function q(o){typeof localStorage<"u"&&localStorage.setItem(S,o==="light"||o==="dark"?o:"")}function x(){return matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function p(o){StarlightThemeProvider.updatePickers(o),document.documentElement.dataset.theme=o==="auto"?x():o,q(o)}matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{b()==="auto"&&p("auto")});customElements.define("starlight-rapide-theme-select",class extends HTMLElement{constructor(){super(),p(b());const e=this.querySelector("button");e?.addEventListener("click",()=>{const r=y(document.documentElement.dataset.theme),s=r==="dark"?"light":r==="light"?"dark":"auto";p(s),e?.setAttribute("aria-label",`${s} theme`)})}});class C extends HTMLElement{constructor(){super(),this.btn=this.querySelector("button"),this.btn.addEventListener("click",()=>this.toggleExpanded());const e=this.closest("nav");e&&e.addEventListener("keyup",r=>this.closeOnEscape(r))}setExpanded(e){this.setAttribute("aria-expanded",String(e)),document.body.toggleAttribute("data-mobile-menu-expanded",e)}toggleExpanded(){this.setExpanded(this.getAttribute("aria-expanded")!=="true")}closeOnEscape(e){e.code==="Escape"&&(this.setExpanded(!1),this.btn.focus())}}customElements.define("starlight-menu-button",C);const H="_top";class v extends HTMLElement{constructor(){super(),this._current=this.querySelector('a[aria-current="true"]'),this.minH=parseInt(this.dataset.minH||"2",10),this.maxH=parseInt(this.dataset.maxH||"3",10);const e=[...this.querySelectorAll("a")],r=t=>{if(t instanceof HTMLHeadingElement){if(t.id===H)return!0;const l=t.tagName[1];if(l){const n=parseInt(l,10);if(n>=this.minH&&n<=this.maxH)return!0}}return!1},s=t=>{if(!t)return null;const l=t;for(;t;){if(r(t))return t;for(t=t.previousElementSibling;t?.lastElementChild;)t=t.lastElementChild;const n=s(t);if(n)return n}return s(l.parentElement)},d=t=>{for(const{isIntersecting:l,target:n}of t){if(!l)continue;const m=s(n);if(!m)continue;const h=e.find(f=>f.hash==="#"+encodeURIComponent(m.id));if(h){this.current=h;break}}},a=document.querySelectorAll("main [id], main [id] ~ *, main .content > *");let i;const c=()=>{i&&i.disconnect(),i=new IntersectionObserver(d,{rootMargin:this.getRootMargin()}),a.forEach(t=>i.observe(t))};c();const u=window.requestIdleCallback||(t=>setTimeout(t,1));let g;window.addEventListener("resize",()=>{i&&i.disconnect(),clearTimeout(g),g=setTimeout(()=>u(c),200)})}set current(e){e!==this._current&&(this._current&&this._current.removeAttribute("aria-current"),e.setAttribute("aria-current","true"),this._current=e)}getRootMargin(){const e=document.querySelector("header")?.getBoundingClientRect().height||0,r=this.querySelector("summary")?.getBoundingClientRect().height||0,s=e+r+32,d=s+53,a=document.documentElement.clientHeight;return`-${s}px 0% ${d-a}px`}}customElements.define("starlight-toc",v);class I extends v{set current(e){super.current=e;const r=this.querySelector(".display-current");r&&(r.textContent=e.textContent)}constructor(){super();const e=this.querySelector("details");if(!e)return;const r=()=>{e.open=!1};e.querySelectorAll("a").forEach(s=>{s.addEventListener("click",r)}),window.addEventListener("click",s=>{e.contains(s.target)||r()}),window.addEventListener("keydown",s=>{if(s.key==="Escape"&&e.open){const d=e.contains(document.activeElement);if(r(),d){const a=e.querySelector("summary");a&&a.focus()}}})}}customElements.define("mobile-starlight-toc",I);class M extends HTMLElement{constructor(){super();const e=this.querySelector("select");e&&e.addEventListener("change",r=>{r.currentTarget instanceof HTMLSelectElement&&(window.location.pathname=r.currentTarget.value)})}}customElements.define("starlight-lang-select",M);export{T as _};
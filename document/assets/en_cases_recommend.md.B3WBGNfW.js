import{_ as i,c as s,o as a,a4 as e}from"./chunks/framework.DKWfLnao.js";const m=JSON.parse('{"title":"Live Streaming and Video","description":"","frontmatter":{},"headers":[],"relativePath":"en/cases/recommend.md","filePath":"en/cases/recommend.md","lastUpdated":1724427218000}'),n={name:"en/cases/recommend.md"},t=e(`<h1 id="live-streaming-and-video" tabindex="-1">Live Streaming and Video <a class="header-anchor" href="#live-streaming-and-video" aria-label="Permalink to &quot;Live Streaming and Video&quot;">​</a></h1><h2 id="description" tabindex="-1">Description <a class="header-anchor" href="#description" aria-label="Permalink to &quot;Description&quot;">​</a></h2><p>In live streaming and video streaming, the real-time requirement for danmaku is relatively high. The default <a href="./../reference/manager-configuration/#config-mode"><strong>collision algorithm configuration</strong></a> is <code>strict</code>, which delays rendering until the rendering conditions are met. <strong>Therefore, you should set it to <code>adaptive</code></strong>. This will make the engine attempt collision detection first, and if the conditions are not met, it will ignore the collision algorithm and render immediately.</p><h2 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h2><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Set it during initialization</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // .</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;adaptive&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Or use the \`setMode()\` API</span></span>
<span class="line highlighted"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setMode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;adaptive&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>If you want to set the minimum spacing between danmaku within a single track (only effective when danmaku hit collision detection)</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">The minimum spacing between danmaku within the same track is </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`10px\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setGap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div>`,7),l=[t];function h(p,r,d,o,k,c){return a(),s("div",null,l)}const E=i(n,[["render",h]]);export{m as __pageData,E as default};

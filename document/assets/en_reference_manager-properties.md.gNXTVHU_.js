import{_ as a,c as e,o as s,a4 as i}from"./chunks/framework.DKWfLnao.js";const m=JSON.parse('{"title":"Manager Properties","description":"","frontmatter":{},"headers":[],"relativePath":"en/reference/manager-properties.md","filePath":"en/reference/manager-properties.md","lastUpdated":1725266341000}'),n={name:"en/reference/manager-properties.md"},t=i('<h1 id="manager-properties" tabindex="-1">Manager Properties <a class="header-anchor" href="#manager-properties" aria-label="Permalink to &quot;Manager Properties&quot;">​</a></h1><div class="note custom-block github-alert"><p class="custom-block-title">Unit Hint</p><p>All units involved in the calculation can be computed through expressions, similar to CSS <code>calc</code>.</p><ol><li><strong><code>number</code></strong>: The default unit is <code>px</code>.</li><li><strong><code>string</code></strong>: Expression calculation. Supports mathematical operations (<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>), and only <code>%</code> and <code>px</code> units are supported.</li></ol><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setGap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;(100% - 10px) / 5&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div></div><h2 id="manager-version" tabindex="-1"><code>manager.version</code> <a class="header-anchor" href="#manager-version" aria-label="Permalink to &quot;`manager.version`&quot;">​</a></h2><p><strong>Type: <code>string</code></strong></p><p>The current version of the <code>danmu</code> library.</p><h2 id="manager-options" tabindex="-1"><code>manager.options</code> <a class="header-anchor" href="#manager-options" aria-label="Permalink to &quot;`manager.options`&quot;">​</a></h2><p><strong>Type: <code>ManagerOptions</code></strong></p><p><a href="./manager-configuration.html"><strong><code>manager.options</code></strong></a>, you can get some initial values from here and use them.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(manager.options.times); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [number, number]</span></span></code></pre></div><h2 id="manager-statuses" tabindex="-1"><code>manager.statuses</code> <a class="header-anchor" href="#manager-statuses" aria-label="Permalink to &quot;`manager.statuses`&quot;">​</a></h2><p><strong>Type: <code>Record&lt;PropertyKey, unknown&gt;</code></strong></p><p>A property for recording states, not used by the kernel. It is mainly provided for business purposes to record some states. The default type is <code>Record&lt;PropertyKey, unknown&gt;</code>, but you can pass a generic type when creating the <code>manager</code>.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { create } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;danmu&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"></span>\n<span class="line highlighted"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">background</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }&gt;();</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.statuses; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Type is `{ background: string }`</span></span></code></pre></div><h2 id="manager-trackcount" tabindex="-1"><code>manager.trackCount</code> <a class="header-anchor" href="#manager-trackcount" aria-label="Permalink to &quot;`manager.trackCount`&quot;">​</a></h2><p><strong>Type: <code>number</code></strong></p><p>The current number of tracks inside the container. When the container size changes and after <code>format</code> (either by manually calling the <code>format()</code> method or by calling the <code>setArea()</code> method), the <code>trackCount</code> will also change accordingly.</p><h2 id="manager-pluginsystem" tabindex="-1"><code>manager.pluginSystem</code> <a class="header-anchor" href="#manager-pluginsystem" aria-label="Permalink to &quot;`manager.pluginSystem`&quot;">​</a></h2><p><strong>Type: <code>PluginSystem</code></strong></p><p>The plugin system instance of <code>manager</code>, its API can be found in the <strong>hooks-plugin</strong> documentation.</p><p><a href="https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis" target="_blank" rel="noreferrer">https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis</a></p><h2></h2><p><strong>The danmaku container instance has the following properties and methods. When you obtain the container instance in some hooks, you can refer to the knowledge in this section.</strong></p><div class="note custom-block github-alert"><p class="custom-block-title">Note</p><p>If you need to change the width and height of the container, it is recommended to use the <code>manager.setArea()</code> method instead of changing it through <code>manager.container.setStyle()</code>. Otherwise, you will need to manually call <code>manager.format()</code>.</p></div><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Container</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>\n<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  width</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  height</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  node</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLDivElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  parentNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StyleKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CSSStyleDeclaration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="manager-container-width" tabindex="-1">manager.container.width <a class="header-anchor" href="#manager-container-width" aria-label="Permalink to &quot;manager.container.width&quot;">​</a></h2><p><strong>Type: <code>number</code></strong><br><strong>Default: <code>0</code></strong></p><p>The <code>width</code> of the container, this value may change after you call <code>manager.format()</code>.</p><h2 id="manager-container-height" tabindex="-1">manager.container.height <a class="header-anchor" href="#manager-container-height" aria-label="Permalink to &quot;manager.container.height&quot;">​</a></h2><p><strong>Type: <code>number</code></strong><br><strong>Default: <code>0</code></strong></p><p>The <code>height</code> of the container, this value may change after you call <code>manager.format()</code>.</p><h2 id="manager-container-node" tabindex="-1">manager.container.node <a class="header-anchor" href="#manager-container-node" aria-label="Permalink to &quot;manager.container.node&quot;">​</a></h2><p><strong>Type: <code>HTMLDivElement</code></strong><br><strong>Default: <code>div</code></strong></p><p>The <code>DOM</code> node of the container.</p><h2 id="manager-container-parentnode" tabindex="-1">manager.container.parentNode <a class="header-anchor" href="#manager-container-parentnode" aria-label="Permalink to &quot;manager.container.parentNode&quot;">​</a></h2><p><strong>Type: <code>HTMLElement | null</code></strong><br><strong>Default: <code>null</code></strong></p><p>The parent node of the container, which can be accessed through this property after being set by <code>manager.mount()</code>.</p><h2 id="manager-container-setstyle" tabindex="-1">manager.container.setStyle() <a class="header-anchor" href="#manager-container-setstyle" aria-label="Permalink to &quot;manager.container.setStyle()&quot;">​</a></h2><p><strong>Type: <code>setStyle&lt;T extends StyleKey&gt;(key: T, val: CSSStyleDeclaration[T]): void</code></strong></p><p>This method can set the style of the container node.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// So you can set some styles for the container in the following way</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.container.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;background&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;red&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div>',40),o=[t];function r(h,l,p,d,c,k){return s(),e("div",null,o)}const y=a(n,[["render",r]]);export{m as __pageData,y as default};

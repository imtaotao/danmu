import{_ as a,c as s,o as i,a4 as e}from"./chunks/framework.DKWfLnao.js";const m=JSON.parse('{"title":"manager 属性","description":"","frontmatter":{},"headers":[],"relativePath":"zh/reference/manager-properties.md","filePath":"zh/reference/manager-properties.md","lastUpdated":1725438521000}'),n={name:"zh/reference/manager-properties.md"},t=e(`<h1 id="manager-属性" tabindex="-1">manager 属性 <a class="header-anchor" href="#manager-属性" aria-label="Permalink to &quot;manager 属性&quot;">​</a></h1><div class="note custom-block github-alert"><p class="custom-block-title">单位提示</p><p>所有参与计算的单位都允许通过表达式来计算，类似 CSS 的 <code>calc</code>。</p><ol><li><strong><code>number</code></strong>：默认单位为 <code>px</code>。</li><li><strong><code>string</code></strong>：表达式计算。支持（<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>）数学计算，只支持 <code>%</code> 和 <code>px</code> 两种单位。</li></ol><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setGap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;(100% - 10px) / 5&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div></div><h2 id="manager-version" tabindex="-1"><code>manager.version</code> <a class="header-anchor" href="#manager-version" aria-label="Permalink to &quot;\`manager.version\`&quot;">​</a></h2><p><strong>类型：<code>string</code></strong></p><p>当前 <code>danmu</code> 库的版本。</p><h2 id="manager-options" tabindex="-1"><code>manager.options</code> <a class="header-anchor" href="#manager-options" aria-label="Permalink to &quot;\`manager.options\`&quot;">​</a></h2><p><strong>类型：<code>ManagerOptions</code></strong></p><p><a href="./manager-configuration.html"><strong><code>manager.options</code></strong></a>，你可以从这里取到一些初始值并使用。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(manager.options.times); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// [number, number]</span></span></code></pre></div><h2 id="manager-statuses" tabindex="-1"><code>manager.statuses</code> <a class="header-anchor" href="#manager-statuses" aria-label="Permalink to &quot;\`manager.statuses\`&quot;">​</a></h2><p><strong>类型：<code>Record&lt;PropertyKey, unknown&gt;</code></strong></p><p>一个记录状态的属性，在内核中没有使用，主要是提供给业务方记录一些状态使用的。默认类型为一个 <code>Record&lt;PropertyKey, unknown&gt;</code>，不过你可以在创建 <code>manager</code> 的时候传递范型。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { create } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;danmu&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line highlighted"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">background</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }&gt;();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.statuses; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类型为 { background: string }</span></span></code></pre></div><h2 id="manager-trackcount" tabindex="-1"><code>manager.trackCount</code> <a class="header-anchor" href="#manager-trackcount" aria-label="Permalink to &quot;\`manager.trackCount\`&quot;">​</a></h2><p><strong>类型：<code>number</code></strong></p><p>当前容器内部轨道的数量。当容器的大小改变后，并且 <code>format</code> 之后（你手动调用 <code>format()</code> 方法或者调用 <code>setArea()</code> 方法），<code>trackCount</code> 也会随之改变。</p><h2 id="manager-pluginsystem" tabindex="-1"><code>manager.pluginSystem</code> <a class="header-anchor" href="#manager-pluginsystem" aria-label="Permalink to &quot;\`manager.pluginSystem\`&quot;">​</a></h2><p><strong>类型：<code>PluginSystem</code></strong></p><p><code>manager</code> 的插件系统实例，其 api 可以见 <strong>hooks-plugin</strong>的文档。</p><p><a href="https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis" target="_blank" rel="noreferrer">https://github.com/imtaotao/hooks-plugin?tab=readme-ov-file#apis</a></p><h2></h2><p><strong>弹幕容器实例上面有以下一些属性和方法，当你在一些钩子里面获取到 container 实例时，可以参考本小节的知识。</strong></p><div class="note custom-block github-alert"><p class="custom-block-title">注意事项</p><p>如果你需要对容器的宽高做更改，建议使用 <code>manager.setArea()</code> 方法，而不要通过 <code>manager.container.setStyle()</code> 来更改，否则你需要手动调用 <code>manager.format()</code>。</p></div><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">declare</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Container</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  width</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  height</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  node</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLDivElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  parentNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HTMLElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StyleKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">val</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CSSStyleDeclaration</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">])</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="manager-container-width" tabindex="-1">manager.container.width <a class="header-anchor" href="#manager-container-width" aria-label="Permalink to &quot;manager.container.width&quot;">​</a></h2><p><strong>类型：<code>number</code></strong><br><strong>默认值：<code>0</code></strong></p><p>容器的宽度，当你调用 <code>manager.format()</code> 后，这个值可能会有变化。</p><h2 id="manager-container-height" tabindex="-1">manager.container.height <a class="header-anchor" href="#manager-container-height" aria-label="Permalink to &quot;manager.container.height&quot;">​</a></h2><p><strong>类型：<code>number</code></strong><br><strong>默认值：<code>0</code></strong></p><p>容器的宽度，当你调用 <code>manager.format()</code> 后，这个值可能会有变化。</p><h2 id="manager-container-node" tabindex="-1">manager.container.node <a class="header-anchor" href="#manager-container-node" aria-label="Permalink to &quot;manager.container.node&quot;">​</a></h2><p><strong>类型：<code>HTMLDivElement</code></strong><br><strong>默认值：<code>div</code></strong></p><p>容器的 DOM 节点。</p><h2 id="manager-container-parentnode" tabindex="-1">manager.container.parentNode <a class="header-anchor" href="#manager-container-parentnode" aria-label="Permalink to &quot;manager.container.parentNode&quot;">​</a></h2><p><strong>类型：<code>HTMLElement | null</code></strong><br><strong>默认值：<code>null</code></strong></p><p>容器的父节点，通过 <code>manager.mount()</code> 设置后，可以通过此属性拿到。</p><h2 id="manager-container-setstyle" tabindex="-1">manager.container.setStyle() <a class="header-anchor" href="#manager-container-setstyle" aria-label="Permalink to &quot;manager.container.setStyle()&quot;">​</a></h2><p><strong>类型：<code>setStyle&lt;T extends StyleKey&gt;(key: T, val: CSSStyleDeclaration[T]): void</code></strong></p><p>这个方法可以设置容器节点的样式。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 所以你可以以下方式来给容器设置一些样式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.container.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;background&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;red&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div>`,40),r=[t];function h(l,o,p,d,k,c){return i(),s("div",null,r)}const E=a(n,[["render",h]]);export{m as __pageData,E as default};

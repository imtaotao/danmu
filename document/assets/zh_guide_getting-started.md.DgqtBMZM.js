import{_ as s,c as i,o as a,a4 as n}from"./chunks/framework.DKWfLnao.js";const c=JSON.parse('{"title":"快速开始","description":"","frontmatter":{},"headers":[],"relativePath":"zh/guide/getting-started.md","filePath":"zh/guide/getting-started.md","lastUpdated":1724666422000}'),t={name:"zh/guide/getting-started.md"},h=n(`<h1 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h1><div class="note custom-block github-alert"><p class="custom-block-title">注意</p><p><a href="https://www.npmjs.com/package/danmu">danmu</a> 目前还没有到 v1.0 版本，不要使用未公开的 API，如果您发现任何错误或意外情况，请在 <a href="https://github.com/imtaotao/danmu/issues/new">GitHub 上创建 issues</a>。</p></div><p><code>danmu</code> 是一个<strong>高度可扩展，功能丰富齐全</strong>的弹幕库，为开发者提供便捷接入和编写自定义插件的能力，满足复杂的需求同时也允许极致的定制化。我们建立了一个<strong>示例站点</strong>，你可以在此看到一些效果。</p><p><a href="https://imtaotao.github.io/danmu" target="_blank" rel="noreferrer">https://imtaotao.github.io/danmu</a></p><h2 id="🎯-为什么选择-danmu" tabindex="-1">🎯 为什么选择 <code>danmu</code> ? <a class="header-anchor" href="#🎯-为什么选择-danmu" aria-label="Permalink to &quot;🎯 为什么选择 \`danmu\` ?&quot;">​</a></h2><p>现代的视频网站或多或少的都有添加弹幕功能，弹幕可以带来一系列不同的观影体验，实现一个好用，功能齐全的弹幕库并不是一件容易的事情，市面上有很多不同的弹幕库选择，但是大多数都依赖都是基于 <code>Canvas</code> 来实现的，这导致样式的绘制会很局限，并且没有什么手段进行扩展，这对后续的迭代来说是致命的，因为换一个库来实现，成本很高。</p><p><code>danmu</code> 基于 <code>CSS + DOM</code> 来绘制弹幕，这意味着，弹幕的运动可以基于浏览器原生的动画能力，并且 <code>CSS + DOM</code> 可以做的事情格外的多，这让不同形式的弹幕都得以存在（想象一下一个弹幕嵌入一个网页的场景）。并且我们提供的弹幕的碰撞计算，弹幕的运动速率可以不是固定的但是也能不会互相碰撞。</p><h2 id="🚀-快速开始" tabindex="-1">🚀 快速开始 <a class="header-anchor" href="#🚀-快速开始" aria-label="Permalink to &quot;🚀 快速开始&quot;">​</a></h2><h3 id="_1-安装依赖" tabindex="-1">1. 安装依赖 <a class="header-anchor" href="#_1-安装依赖" aria-label="Permalink to &quot;1. 安装依赖&quot;">​</a></h3><p>你可以使用您喜欢的包管理器在项目的依赖项中安装 <code>danmu</code>，从而将 Danmaku 添加到您现有的项目当中：</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-Caz59" id="tab-r4N5Ucz" checked><label for="tab-r4N5Ucz">npm</label><input type="radio" name="group-Caz59" id="tab-Y4Jpqtb"><label for="tab-Y4Jpqtb">pnpm</label><input type="radio" name="group-Caz59" id="tab-ActQiN6"><label for="tab-ActQiN6">yarn</label></div><div class="blocks"><div class="language-sh vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danmu</span></span></code></pre></div><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danmu</span></span></code></pre></div><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danamu</span></span></code></pre></div></div></div><p>我们也提供了 <code>CDN</code> 供你来开发调试，<strong>不要在生产环境使用此 <code>CDN</code></strong>：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://unpkg.com/danmu/dist/danmu.umd.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="_2-创建-manager" tabindex="-1">2. 创建 <code>manager</code> <a class="header-anchor" href="#_2-创建-manager" aria-label="Permalink to &quot;2. 创建 \`manager\`&quot;">​</a></h3><p><code>danmu</code> 核心包只暴露了一个 <code>create</code> 方法，用来创建一个 <code>manager</code> 实例，是的，我们所有的实现都是多实例的方式实现的，创建的时候传入的配置可以看<a href="./../reference/manager-configuration.html"><strong>配置</strong></a>这一章节的介绍。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { create } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;danmu&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在此处创建一个 manager 实例，如果不传递则会使用默认的配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trackHeight: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;20%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    willRender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ref.type); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 即将要渲染的弹幕类型</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ref.danmaku); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 即将要渲染的弹幕实例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ref.prevent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置为 true 将阻止渲染，可以在这里做弹幕过滤工作</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ref;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // .</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="_3-挂载并渲染" tabindex="-1">3. 挂载并渲染 <a class="header-anchor" href="#_3-挂载并渲染" aria-label="Permalink to &quot;3. 挂载并渲染&quot;">​</a></h3><p>当我们创建好了一个 <code>manager</code> 的时候就可以挂载到某个具体的节点上并渲染，实际上 <code>manager</code> 内部会启动一个定时器来轮询将内存区的弹幕来渲染出来，而轮询的时间是交由你来控制的（如果没有通过配置传递，会有一个默认的值 <strong><code>500ms</code></strong>，详见配置章节）。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> container</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getElementById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;container&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 挂载，然后开始渲染</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(container).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startPlaying</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h3 id="_4-发送普通弹幕" tabindex="-1">4. 发送普通弹幕 <a class="header-anchor" href="#_4-发送普通弹幕" aria-label="Permalink to &quot;4. 发送普通弹幕&quot;">​</a></h3><p>当前面的一些工作准备完成之后，就可以发送弹幕了。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 发送弹幕的内容类型可以在创建 manager 的时候通过范型来约定，可以看后面的章节</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;弹幕内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>但是通过 <a href="./../reference/manager-api/#manager-push"><strong><code>manager.push</code></strong></a> 方法来发送的弹幕可能会受到弹幕算法的影响，不会立即渲染，想象一些往一个数组里面 push 一个数据，但是消费是从数组最前端拿出数据消费的。我们可以换一个 <a href="./../reference/manager-api/#manager-unshift"><strong><code>manager.unshift</code></strong></a> 方法来发送弹幕。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 这会在下一次渲染轮询中，立即渲染</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unshift</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;弹幕内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>我们在初始化 <code>manager</code> 的时候，可以通过 <code>plugin</code> 属性来传递默认全局插件，他的作用域是对所有的弹幕都生效，而且包含<a href="./../reference/manager-hooks.html"><strong>全局</strong></a>和<a href="./../reference/danmaku-hooks.html"><strong>弹幕</strong></a>两种类型的钩子。</p><p>不过我们在发送弹幕的时候，也可以传递弹幕自己的插件，他不包含全局钩子，<strong>作用域只对当前渲染的弹幕生效</strong>，如果你需要的话，这会让你更好的来控制当前要渲染的这个弹幕。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;弹幕内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    moveStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // moveStart 钩子会在弹幕即将开始运动之前触发，你可以在这里更改弹幕的样式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      danmaku.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(csskey, cssValue);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // .</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="_5-发送高级弹幕" tabindex="-1">5. 发送高级弹幕 <a class="header-anchor" href="#_5-发送高级弹幕" aria-label="Permalink to &quot;5. 发送高级弹幕&quot;">​</a></h3><p>普通弹幕会受到碰撞渲染算法的限制，对于那些需要特殊处理的弹幕，例如顶部弹幕，特殊位置的弹幕，则需要通过 <a href="./../reference/manager-api/#manager-pushflexibledanmaku"><strong><code>manager.pushFlexibleDanmaku</code></strong></a> 这个 <code>API</code> 发送高级弹幕来渲染，高级弹幕不会受到碰撞算法的限制。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-diff vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pushFlexibleDanmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;弹幕内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  id: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 可选参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  duration: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 默认从 manager.options.times 中随机取一个值</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  direction: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;none&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 默认取 manager.options.direction 的值</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  position</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">container</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 这会让弹幕在容器居中的位置出现，因为 direaction 为 none，所以会静止播放 1s</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      x: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`50% - \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">danmaku</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getWidth</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      y: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`50% - \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">danmaku</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getHeight</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // plugin 参数是可选的，具体可以参考普通弹幕的钩子，这里是一样的</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div>`,30),e=[h];function p(l,k,d,r,E,g){return a(),i("div",null,e)}const y=s(t,[["render",p]]);export{c as __pageData,y as default};

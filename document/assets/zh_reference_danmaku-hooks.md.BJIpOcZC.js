import{_ as s,c as a,o as i,a4 as e}from"./chunks/framework.DKWfLnao.js";const g=JSON.parse('{"title":"弹幕钩子","description":"","frontmatter":{},"headers":[],"relativePath":"zh/reference/danmaku-hooks.md","filePath":"zh/reference/danmaku-hooks.md","lastUpdated":1724550868000}'),n={name:"zh/reference/danmaku-hooks.md"},t=e('<h1 id="弹幕钩子" tabindex="-1">弹幕钩子 <a class="header-anchor" href="#弹幕钩子" aria-label="Permalink to &quot;弹幕钩子&quot;">​</a></h1><p>弹幕的钩子只会在弹幕自身的行为发生改变的时候进行进行触发。</p><p><strong>1. 通过 <code>manager</code> 注册</strong></p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 通过 `manager` 来注册需要加上 `$` 前缀</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { create } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;danmu&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    $hide</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {},</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    $show</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {},</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><p><strong>2. 通过弹幕实例来注册</strong></p><p>如果你在其他全局钩子里面拿到了弹幕实例，则可以通过这种方式注册，这在插件的编写中会很有用。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">danmaku.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">use</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  hide</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {},</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  show</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {},</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h2 id="hooks-hide" tabindex="-1"><code>hooks.hide</code> <a class="header-anchor" href="#hooks-hide" aria-label="Permalink to &quot;`hooks.hide`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>hide</code> 钩子会在弹幕隐藏的时候触发。</p><h2 id="hooks-show" tabindex="-1"><code>hooks.show</code> <a class="header-anchor" href="#hooks-show" aria-label="Permalink to &quot;`hooks.show`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>show</code> 钩子会在弹幕从隐藏到显示的时候触发。</p><h2 id="hooks-pause" tabindex="-1"><code>hooks.pause</code> <a class="header-anchor" href="#hooks-pause" aria-label="Permalink to &quot;`hooks.pause`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>pause</code> 钩子会在弹幕暂停的时候触发。</p><h2 id="hooks-resume" tabindex="-1"><code>hooks.resume</code> <a class="header-anchor" href="#hooks-resume" aria-label="Permalink to &quot;`hooks.resume`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>resume</code> 钩子会在弹幕从暂停恢复的时候触发。</p><h2 id="hooks-destroy" tabindex="-1"><code>hooks.destroy</code> <a class="header-anchor" href="#hooks-destroy" aria-label="Permalink to &quot;`hooks.destroy`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;, unknown]&gt;</code></strong></p><p><code>destroy</code> 钩子会在弹幕销毁的时候触发，如果你需要手动调用 <a href="./../reference/danmaku-methods/#danmaku-destroy"><strong><code>danmaku.destory</code></strong></a> 方法，可以尝试传递 <code>mark</code>。</p><h2 id="hooks-movestart" tabindex="-1"><code>hooks.moveStart</code> <a class="header-anchor" href="#hooks-movestart" aria-label="Permalink to &quot;`hooks.moveStart`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>moveStart</code> 钩子会在弹幕即将运动的时候触发，你可以在此时对弹幕做一些样式变更操作。</p><h2 id="hooks-moveend" tabindex="-1"><code>hooks.moveEnd</code> <a class="header-anchor" href="#hooks-moveend" aria-label="Permalink to &quot;`hooks.moveEnd`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>moveEnd</code> 钩子会在弹幕运动结束的时候触发，运动结束不代表会立即销毁，为了性能考虑，内核引擎会批量收集统一销毁。</p><h2 id="hooks-appendnode" tabindex="-1"><code>hooks.appendNode</code> <a class="header-anchor" href="#hooks-appendnode" aria-label="Permalink to &quot;`hooks.appendNode`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>appendNode</code> 钩子会在弹幕的节点添加到容器时候触发，他在 <code>createNode</code> 节点之后。</p><h2 id="hooks-removenode" tabindex="-1"><code>hooks.removeNode</code> <a class="header-anchor" href="#hooks-removenode" aria-label="Permalink to &quot;`hooks.removeNode`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>removeNode</code> 钩子会在弹幕从容器胡总移除的时候触发。</p><h2 id="hooks-createnode" tabindex="-1"><code>hooks.createNode</code> <a class="header-anchor" href="#hooks-createnode" aria-label="Permalink to &quot;`hooks.createNode`&quot;">​</a></h2><p><strong>类型：<code>SyncHook&lt;[Danmaku&lt;T&gt;]&gt;</code></strong></p><p><code>createNode</code> 钩子会在弹幕的内置 HTML 节点创建后时候触发，你可以在这个钩子里面通过 <code>danmaku.node</code> 拿到这个节点，<strong>进行一些样式和节点的渲染操作，这本框架扩展性很重要的一步操作，很重要</strong>。</p><p><strong>示例：</strong></p><div class="language-tsx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">tsx</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DanmakuComponent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">props</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; }) {</span></span>\n<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{props.danmaku.data.value}&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;;</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">use</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  $createNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>\n<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 将组件渲染到弹幕的内置节点上</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ReactDOM.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createRoot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(danmaku.node).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">DanmakuComponent</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> danmaku</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{danmaku} /&gt;,</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    );</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>\n<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div>',39),h=[t];function o(k,p,l,d,r,c){return i(),a("div",null,h)}const y=s(n,[["render",o]]);export{g as __pageData,y as default};

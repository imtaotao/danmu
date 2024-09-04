import{_ as s,c as a,o as i,a4 as n}from"./chunks/framework.DKWfLnao.js";const E=JSON.parse('{"title":"Getting Started","description":"","frontmatter":{},"headers":[],"relativePath":"en/guide/getting-started.md","filePath":"en/guide/getting-started.md","lastUpdated":1725438521000}'),e={name:"en/guide/getting-started.md"},t=n(`<h1 id="getting-started" tabindex="-1">Getting Started <a class="header-anchor" href="#getting-started" aria-label="Permalink to &quot;Getting Started&quot;">​</a></h1><div class="note custom-block github-alert"><p class="custom-block-title">Tip</p><p><a href="https://www.npmjs.com/package/danmu">danmu</a> is not yet at version 1.0. Please avoid using undocumented APIs. If you encounter any bugs or unexpected behavior, please <a href="https://github.com/imtaotao/danmu/issues/new">create an issue on GitHub</a>。</p></div><p><code>danmu</code> is a <strong>highly extensible</strong> and <strong>feature-rich</strong> danmaku library that provides developers with easy integration and the ability to write custom plugins. It meets complex requirements while also allowing for extreme customization. We have set up a demo site where you can see some examples in action.</p><p><a href="https://imtaotao.github.io/danmu" target="_blank" rel="noreferrer">https://imtaotao.github.io/danmu</a></p><h2 id="🎯-why-choose-danmu" tabindex="-1">🎯 Why Choose <code>danmu</code> ? <a class="header-anchor" href="#🎯-why-choose-danmu" aria-label="Permalink to &quot;🎯 Why Choose \`danmu\` ?&quot;">​</a></h2><p>Modern video websites often incorporate danmaku, which can enhance the viewing experience in various ways. Creating a functional and feature-rich danmaku library is not an easy task. There are many different danmaku libraries available, but most of them rely on <code>Canvas</code> for rendering. This approach limits the styling capabilities and offers little room for extension. Such limitations can be detrimental for future iterations, as switching to a different library would be costly.</p><p>The <code>danmu</code> uses <code>CSS + DOM</code> to render danmaku, which means the movement of danmaku can leverage the browser&#39;s native animation capabilities. <code>CSS + DOM</code> offers extensive possibilities, allowing for various forms of danmaku (imagine a danmaku embedding a webpage). Additionally, we provide collision detection for danmaku, ensuring that even if the movement speed of danmaku is not fixed, they will not collide with each other.</p><h2 id="🚀-quick-start" tabindex="-1">🚀 Quick Start <a class="header-anchor" href="#🚀-quick-start" aria-label="Permalink to &quot;🚀 Quick Start&quot;">​</a></h2><h3 id="_1-install-dependencies" tabindex="-1">1. Install Dependencies <a class="header-anchor" href="#_1-install-dependencies" aria-label="Permalink to &quot;1. Install Dependencies&quot;">​</a></h3><p>You can use your preferred package manager to install <code>danmu</code> as a dependency in your project, thereby adding Danmaku to your existing project:</p><div class="vp-code-group vp-adaptive-theme"><div class="tabs"><input type="radio" name="group-6Wj1X" id="tab-cb9l7ZD" checked><label for="tab-cb9l7ZD">npm</label><input type="radio" name="group-6Wj1X" id="tab-2AhkJq1"><label for="tab-2AhkJq1">pnpm</label><input type="radio" name="group-6Wj1X" id="tab-BTGuQlI"><label for="tab-BTGuQlI">yarn</label></div><div class="blocks"><div class="language-sh vp-adaptive-theme active"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danmu</span></span></code></pre></div><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pnpm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danmu</span></span></code></pre></div><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> yarn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> danmu</span></span></code></pre></div></div></div><p>We also provide a <code>CDN</code> for development and debugging purposes. <strong>Do not use this <code>CDN</code> in a production environment</strong>:</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://unpkg.com/danmu/dist/danmu.umd.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="_2-create-manager" tabindex="-1">2. Create Manager <a class="header-anchor" href="#_2-create-manager" aria-label="Permalink to &quot;2. Create Manager&quot;">​</a></h3><p>The <code>danmu</code> core package exposes only a <code>create</code> method, which is used to create a <code>manager</code> instance. Yes, all our implementations are multi-instance. For the configuration options that can be passed during creation, please refer to the <a href="./../reference/manager-configuration.html"><strong>Configuration</strong></a> section.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { create } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;danmu&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Create a manager instance here. If no configuration is passed,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// the default configuration will be used.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> manager</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trackHeight: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;20%&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    willRender</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // Types of Danmaku to be Rendered</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ref.type);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // Danmaku Instances to be Rendered</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ref.danmaku);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // Set to \`true\` to prevent rendering.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // You can perform danmaku filtering here</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ref.prevent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ref;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // .</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="_3-mount-and-render" tabindex="-1">3. Mount and Render <a class="header-anchor" href="#_3-mount-and-render" aria-label="Permalink to &quot;3. Mount and Render&quot;">​</a></h3><p>Once we have created a <code>manager</code>, we can mount it to a specific node and render it. In fact, the <code>manager</code> internally starts a timer to poll and render the danmaku from the memory area. The polling interval is controlled by you. If not passed through configuration, there is a default value of <strong><code>500ms</code></strong>, see the <a href="./../reference/manager-configuration.html"><strong>Configuration</strong></a> section for details.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> container</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getElementById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;container&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Mount and Start Rendering</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(container);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startPlaying</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h3 id="_4-send-facile-danmaku" tabindex="-1">4. Send Facile Danmaku <a class="header-anchor" href="#_4-send-facile-danmaku" aria-label="Permalink to &quot;4. Send Facile Danmaku&quot;">​</a></h3><p>Once the preliminary setup is complete, you can start sending danmaku.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// The content type of the danmaku can be specified using generics when creating the manager.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Refer to the later sections for more details.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;content&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>However, danmaku sent using the <a href="./../reference/manager-api/#manager-push"><strong><code>manager.push</code></strong></a> method may be affected by the danmaku algorithm and may not render immediately. Imagine pushing data into an array, but the consumption happens from the front of the array. We can use the <a href="./../reference/manager-api/#manager-unshift"><strong><code>manager.unshift</code></strong></a> method to send danmaku instead.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// This will render immediately in the next rendering poll.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unshift</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;content&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p>When initializing the <code>manager</code>, you can pass default global plugins through the <code>plugin</code> property. These plugins will be effective for all danmaku and include both <a href="./../reference/manager-hooks.html"><strong>global</strong></a> and <a href="./../reference/danmaku-hooks.html"><strong>danmaku</strong></a> types of hooks.</p><p>However, when sending danmaku, you can also pass plugins specific to the danmaku. These do not include global hooks and <strong>are only effective for the currently rendered danmaku</strong>. If needed, this allows you to better control the danmaku being rendered.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">push</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;content&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    moveStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // The moveStart hook is triggered just before the danmaku starts moving.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // You can change the danmaku&#39;s style here.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      danmaku.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setStyle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(cssKey, cssValue);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // .</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="_5-send-flexible-danmaku" tabindex="-1">5. Send Flexible Danmaku <a class="header-anchor" href="#_5-send-flexible-danmaku" aria-label="Permalink to &quot;5. Send Flexible Danmaku&quot;">​</a></h3><p>Facile danmaku will be limited by the collision rendering algorithm. For those danmaku that require special handling, such as top danmaku or danmaku in special positions, you need to send flexible danmaku through the <a href="./../reference/manager-api/#manager-pushflexibledanmaku"><strong><code>manager.pushFlexibleDanmaku</code></strong></a> API to render them. Flexible danmaku will not be restricted by the collision algorithm.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark has-diff vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">manager.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pushFlexibleDanmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;content&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  id: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Optional parameters</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  duration: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Defaults to a random value from \`manager.options.times\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  direction: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;none&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Defaults to the value of \`manager.options.direction\`</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  position</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">danmaku</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">container</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // This will make the danmaku appear in the center of the container.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // Since the \`direction\` is set to \`none\`, it will remain stationary for \`1s\`</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      x: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`50% - \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">danmaku</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getWidth</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line diff add"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      y: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`50% - \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">danmaku</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getHeight</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugin: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // The plugin parameter is optional.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // For details, refer to the hooks for regular danmaku,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // as they are the same here.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div>`,30),l=[t];function h(p,k,r,d,o,g){return i(),a("div",null,l)}const u=s(e,[["render",h]]);export{E as __pageData,u as default};

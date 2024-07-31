---
title: '概览'
description: 所有的 api 和 钩子
sidebar:
  order: 0
---

import { Card, CardGrid } from '@astrojs/starlight/components';
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="Manager" icon="moon">
    <CardGrid>
      <Card title="全局配置">
        [**`mode`**](./manager-config/#mode) <br />
        [**`rate`**](./manager-config/#rate) <br />
        [**`gap`**](./manager-config/#gap) <br />
        [**`interval`**](./manager-config/#interval) <br />
        [**`direction`**](./manager-config/#direction) <br />
        [**`trackHeight`**](./manager-config/#trackheight) <br />
        [**`times`**](./manager-config/#times) <br />
        [**`limits`**](./manager-config/#limits) <br />
        [**`plugin`**](./manager-config/#plugin)
      </Card>
      <Card title="全局钩子">
        弹幕钩子以 `$` 前缀开头。 <br />
        [**`$hide`**](./danmaku-hooks/#hide) <br />
        [**`$show`**](./danmaku-hooks/#show) <br />
        [**`$pause`**](./danmaku-hooks/#pause) <br />
        [**`$resume`**](./danmaku-hooks/#resume) <br />
        [**`$destroy`**](./danmaku-hooks/#destroy) <br />
        [**`$moveEnd`**](./danmaku-hooks/#moveend) <br />
        [**`$moveStart`**](./danmaku-hooks/#moveend) <br />
        [**`$createNode`**](./danmaku-hooks/#movestart) <br />
        [**`$appendNode`**](./danmaku-hooks/#appendnode) <br />
        [**`$removeNode`**](./danmaku-hooks/#removenode) <br />
        [**`init`**](./manager-hooks/#init) <br />
        [**`push`**](./manager-hooks/#push) <br />
        [**`start`**](./manager-hooks/#start) <br />
        [**`stop`**](./manager-hooks/#stop) <br />
        [**`show`**](./manager-hooks/#show) <br />
        [**`hide`**](./manager-hooks/#hide) <br />
        [**`clear`**](./manager-hooks/#clear) <br />
        [**`mount`**](./manager-hooks/#mount) <br />
        [**`unmount`**](./manager-hooks/#unmount) <br />
        [**`freeze`**](./manager-hooks/#freeze) <br />
        [**`unfreeze`**](./manager-hooks/#unfreeze) <br />
        [**`format`**](./manager-hooks/#format) <br />
        [**`render`**](./manager-hooks/#render) <br />
        [**`willRender`**](./manager-hooks/#willRender) <br />
        [**`finished`**](./manager-hooks/#finished) <br />
        [**`limitWarning`**](./manager-hooks/#limitWarning) <br />
        [**`updateOptions`**](./manager-hooks/#updateOptions)
      </Card>
      <Card title="全局属性">
        [**`version`**](./manager-api/#version) <br />
        [**`options`**](./manager-api/#options) <br />
        [**`statuses`**](./manager-api/#statuses) <br />
        [**`box`**](./manager-api/#box) <br />
        [**`container`**](./manager-api/#container) <br />
        [**`pluginSystem`**](./manager-api/#pluginsystem) <br />
      </Card>
      <Card title="全局 API">
        [**`isShow()`**](./manager-api/#isshow) <br />
        [**`isFreeze()`**](./manager-api/#isfreeze) <br />
        [**`isPlaying()`**](./manager-api/#isplaying) <br />
        [**`isDanmaku()`**](./manager-api/#isdanmaku) <br />
        [**`setArea()`**](./manager-api/#setarea) <br />
        [**`setOpacity()`**](./manager-api/#setopacity) <br />
        [**`setStyle()`**](./manager-api/#setstyle) <br />
        [**`setRate()`**](./manager-api/#setrate) <br />
        [**`setMode()`**](./manager-api/#setmode) <br />
        [**`setGap()`**](./manager-api/#setgap) <br />
        [**`setTimes()`**](./manager-api/#settimes) <br />
        [**`setLimits()`**](./manager-api/#setlimits) <br />
        [**`setInterval()`**](./manager-api/#setinterval) <br />
        [**`setDirection()`**](./manager-api/#setdirection) <br />
        [**`setTrackHeight()`**](./manager-api/#settrackheight) <br />
        [**`canPush()`**](./manager-api/#canpush) <br />
        [**`push()`**](./manager-api/#push) <br />
        [**`unshift()`**](./manager-api/#unshift) <br />
        [**`pushFlexibleDanmaku()`**](./manager-api/#pushflexibledanmaku) <br />
        [**`len()`**](./manager-api/#len) <br />
        [**`each()`**](./manager-api/#each) <br />
        [**`asyncEach()`**](./manager-api/#asynceach) <br />
        [**`mount()`**](./manager-api/#mount) <br />
        [**`unmount()`**](./manager-api/#unmount) <br />
        [**`clear()`**](./manager-api/#clear ) <br />
        [**`updateOptions()`**](./manager-api/#updateoptions) <br />
        [**`startPlaying()`**](./manager-api/#startplaying) <br />
        [**`stopPlaying()`**](./manager-api/#stopplaying) <br />
        [**`hide()`**](./manager-api/#hide) <br />
        [**`show()`**](./manager-api/#show) <br />
        [**`nextFrame()`**](./manager-api/#nextframe) <br />
        [**`remove()`**](./manager-api/#remove) <br />
        [**`use()`**](./manager-api/#use) <br />
        [**`updateOccludedUrl()`**](./manager-api/#updateoccludedurl)
      </Card>
    </CardGrid>
  </TabItem>
  <TabItem label="弹幕" icon="star">
    <CardGrid>
      <Card title="弹幕钩子">
        [**`hide`**](./danmaku-hooks/#hide) <br />
        [**`show`**](./danmaku-hooks/#show) <br />
        [**`pause`**](./danmaku-hooks/#pause) <br />
        [**`resume`**](./danmaku-hooks/#resume) <br />
        [**`destroy`**](./danmaku-hooks/#destroy) <br />
        [**`moveEnd`**](./danmaku-hooks/#moveend) <br />
        [**`moveStart`**](./danmaku-hooks/#movestart) <br />
        [**`createNode`**](./danmaku-hooks/#createnode) <br />
        [**`appendNode`**](./danmaku-hooks/#appendnode) <br />
        [**`removeNode`**](./danmaku-hooks/#removenode)
      </Card>
      <Card title="弹幕属性">
        [**`data`**](./danmaku-api/#data) <br />
        [**`type`**](./danmaku-api/#type) <br />
        [**`node`**](./danmaku-api/#node) <br />
        [**`duration`**](./danmaku-api/#duration) <br />
        [**`direction`**](./danmaku-api/#direction) <br />
        [**`pluginSystem`**](./danmaku-api/#pluginsystem)
      </Card>
      <Card title="弹幕 API">
        [**`hide()`**](./danmaku-api/#hide) <br />
        [**`show()`**](./danmaku-api/#show) <br />
        [**`pause()`**](./danmaku-api/#pause) <br />
        [**`resume()`**](./danmaku-api/#resume) <br />
        [**`setloop()`**](./danmaku-api/#setloop) <br />
        [**`unloop()`**](./danmaku-api/#unloop) <br />
        [**`destroy()`**](./danmaku-api/#destroy) <br />
        [**`setStyle()`**](./danmaku-api/#setstyle) <br />
        [**`getWidth()`**](./danmaku-api/#getwidth) <br />
        [**`getHeight()`**](./danmaku-api/#getheight) <br />
        [**`remove()`**](./danmaku-api/#remove) <br />
        [**`use()`**](./danmaku-api/#use)
      </Card>
    </CardGrid>
  </TabItem>
</Tabs>
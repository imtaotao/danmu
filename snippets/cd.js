export function run(manager) {
  const cd = 3000; // 3s
  const map = Object.create(null);

  manager.use({
    name: 'cd',
    willRender(ref) {
      const now = Date.now();
      const content = ref.danmaku.data;
      const prevTime = map[content];

      if (prevTime && now - prevTime < cd) {
        ref.prevent = true;
        console.warn(`"${content}" is blocked.`);
      } else {
        map[content] = now;
      }
      return ref;
    },
  });
}

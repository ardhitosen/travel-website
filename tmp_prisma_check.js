const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const cols = await p.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
    console.log('PRAGMA table_info BannerSlide:');
    const safe = cols.map(row => {
      const out = {};
      for (const k of Object.keys(row || {})) {
        const v = row[k];
        if (typeof v === 'bigint') out[k] = v.toString();
        else out[k] = v;
      }
      return out;
    });
    console.log(JSON.stringify(safe, null, 2));
  } catch (e) {
    console.error('ERR', e && e.message ? e.message : e);
  } finally {
    await p.$disconnect();
  }
})();

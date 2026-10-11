const http = require('http');
const mineflayer = require('mineflayer');
const autoEat = require('mineflayer-auto-eat').plugin;

// سيرفر وهمي لإبقاء البوت شغال على الاستضافات المجانية
http.createServer((req, res) => res.end('AFK Bot is Online 24/7!')).listen(process.env.PORT || 8080);

let bot = null;
let moveInterval = null;

function startBot() {
    console.log('جاري الاتصال وإيقاظ السيرفر...');

    // تنظيف أي جلسة قديمة
    if (bot) {
        bot.removeAllListeners();
        bot = null;
    }
    if (moveInterval) clearInterval(moveInterval);

    bot = mineflayer.createBot({
        host: 'pixelcraftverse23166456456.mcsh.io',
        port: 25565,
        username: 'AFK_Bot_247',
        version: '1.21.1',
        hideErrors: true
    });

    // إضافة بلجن الأكل التلقائي
    bot.loadPlugin(autoEat);

    // إعادة الإحياء التلقائي
    bot.on('death', () => {
        console.log('مات البوت، جاري إعادة الإحياء...');
        bot.respawn();
    });

    // التعامل الذكي مع الشات والتسجيل
    bot.on('messagestr', (message) => {
        const msg = message.toLowerCase();
        if (msg.includes('register')) {
            bot.chat('/register 12345678 12345678');
        } else if (msg.includes('login')) {
            bot.chat('/login 12345678');
        }
    });

    // الدفاع التلقائي عن النفس عند التعرض للهجوم
    bot.on('entityHurt', (entity) => {
        if (entity === bot.entity) {
            const attacker = bot.nearestEntity((e) => (e.type === 'mob' || e.type === 'player') && e.position.distanceTo(bot.entity.position) < 4);
            if (attacker) bot.attack(attacker);
        }
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت واستقراره!');

        // تفعيل الأكل التلقائي عند الجوع
        bot.autoEat.options = { priority: 'foodPoints', startHTML: 14, BannedFood: [] };

        // حركة معقدة وغير منتظمة لتفادي الـ Anti-AFK والحفاظ على الأمان
        moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            // عدم التحرك لو السكينة/الدم قليل جداً
            if (bot.health < 5) return;

            const controls = ['forward', 'back', 'left', 'right'];
            const randomControl = controls[Math.floor(Math.random() * controls.length)];

            // فحص وجود لافا أو هبوط حاد أمام البوت
            const blockAhead = bot.blockAtCursor(2);
            if (blockAhead && (blockAhead.name.includes('lava') || blockAhead.name.includes('air'))) {
                bot.setControlState('back', true);
            } else {
                bot.setControlState(randomControl, true);
            }

            if (Math.random() > 0.5) bot.setControlState('sprint', true);
            if (Math.random() > 0.7) bot.setControlState('sneak', true);
            if (Math.random() > 0.4) bot.setControlState('jump', true);

            // تحريك الرأس بشكل طبيعي
            const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
            const pitch = (Math.random() * 180 - 90) * (Math.PI / 180);
            bot.look(yaw, pitch, true);

            setTimeout(() => {
                if (bot && bot.entity) bot.clearControlStates();
            }, 1000 + Math.random() * 800);

        }, 3000 + Math.random() * 2000); // زمن متغير لمنع الاكتشاف
    });

    bot.on('kicked', (reason) => console.log('تم الطرد:', JSON.stringify(reason)));
    bot.on('error', (err) => console.log('خطأ اتصال:', err.message));

    bot.on('end', () => {
        console.log('انقطع الاتصال، جاري إعادة المحاولة بعد 15 ثانية...');
        if (moveInterval) clearInterval(moveInterval);
        setTimeout(startBot, 15000);
    });
}

// معالجة الأخطاء الكلية لمنع الـ Crash
process.on('uncaughtException', (err) => console.log('خطأ غير متوقع:', err.message));
process.on('unhandledRejection', (err) => console.log('رفض غير معالج:', err));

startBot();

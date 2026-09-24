const http = require('http');
// سيرفر بسيط لإبقاء الخدمة أونلاين
http.createServer((req, res) => res.end('AFK Bot is Online!')).listen(process.env.PORT || 8080);

const mineflayer = require('mineflayer');

function createBot() {
    console.log('جاري محاولة الاتصال بالسيرفر...');
    
    const bot = mineflayer.createBot({
        host: 'voidsmp2103912381230.falixsrv.me',
        port: 25565,
        username: 'AFK_Bot_247',
        version: '1.21.1',
        hideErrors: true
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت للسيرفر واستقراره بنجاح!');

        // تسجيل الدخول بعد 5 ثوانٍ
        setTimeout(() => {
            bot.chat('/register 12345678 12345678'); 
            bot.chat('/login 12345678');
        }, 5000);

        // حركة قفز خفيفة كل 10 ثوانٍ
        const moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            bot.setControlState('jump', true);
            setTimeout(() => {
                if (bot && bot.entity) bot.setControlState('jump', false);
            }, 500);
        }, 10000);

        bot.on('end', () => clearInterval(moveInterval));
    });

    // طباعة سبب الطرد بدون عمل Crash
    bot.on('kicked', reason => {
        console.log('تم طرد البوت من السيرفر لسبب:', JSON.stringify(reason));
    });

    bot.on('error', err => {
        console.log('حدث خطأ في الاتصال:', err.message);
    });

    bot.on('end', () => {
        console.log('انقطع الاتصال بالسيرفر. إعادة المحاولة خلال 20 ثانية...');
        setTimeout(createBot, 20000);
    });
}

// معالجة الأخطاء العامة لمنع انهيار السكريبت
process.on('uncaughtException', err => {
    console.log('خطأ غير متوقع تم احتواؤه:', err.message);
});

process.on('unhandledRejection', err => {
    console.log('تحذير رفض غير معالج:', err);
});

createBot();

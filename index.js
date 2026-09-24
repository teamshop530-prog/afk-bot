const http = require('http');
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

        // حركة تجول مشي وقفز عشوائي كل 6 ثوانٍ
        const moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            // اختيار اتجاه عشوائي (أمام، خلف، يسار، يمين)
            const controls = ['forward', 'back', 'left', 'right'];
            const randomControl = controls[Math.floor(Math.random() * controls.length)];

            bot.setControlState(randomControl, true);
            
            // قفز بنسبة 50% مع الحركة
            if (Math.random() > 0.5) {
                bot.setControlState('jump', true);
            }

            // إيقاف الحركة بعد ثانية واحدة
            setTimeout(() => {
                if (bot && bot.entity) {
                    bot.clearControlStates();
                }
            }, 1000);

        }, 6000);

        bot.on('end', () => clearInterval(moveInterval));
    });

    bot.on('kicked', reason => {
        console.log('تم طرد البوت لسبب:', JSON.stringify(reason));
    });

    bot.on('error', err => {
        console.log('حدث خطأ في الاتصال:', err.message);
    });

    bot.on('end', () => {
        console.log('انقطع الاتصال. إعادة المحاولة خلال 20 ثانية...');
        setTimeout(createBot, 20000);
    });
}

process.on('uncaughtException', err => {
    console.log('خطأ غير متوقع تم احتواؤه:', err.message);
});

process.on('unhandledRejection', err => {
    console.log('تحذير رفض غير معالج:', err);
});

createBot();

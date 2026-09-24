const http = require('http');
http.createServer((req, res) => res.end('AFK Bot is Active!')).listen(process.env.PORT || 8080);

const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'voidsmp2103912381230.falixsrv.me',
        port: 25565,
        username: 'AFK_Bot_247',
        version: '1.21.1' // تحديد إصدار السيرفر لتفادي الطرد
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت للسيرفر واستقراره بنجاح!');

        // انتظر 5 ثواني قبل إرسال أوامر التسجيل لمنع طرد Anti-Spam
        setTimeout(() => {
            bot.chat('/register 12345678 12345678'); 
            bot.chat('/login 12345678');
        }, 5000);

        // حركة خفيفة كل 10 ثواني لمنع الطرد بسلاسة
        setInterval(() => {
            const moves = ['forward', 'back', 'left', 'right'];
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            
            bot.setControlState(randomMove, true);
            if (Math.random() < 0.5) bot.setControlState('jump', true);

            setTimeout(() => {
                bot.clearControlStates();
            }, 1000);
        }, 5000);

    // معرفة سبب الطرد بالتفصيل في الـ Logs
    bot.on('kicked', reason => console.log('تم طرد البوت لسبب:', reason));

    bot.on('end', () => {
        console.log('انقطع الاتصال، جاري إعادة الاتصال بعد 15 ثانية...');
        setTimeout(createBot, 15000);
    });

    bot.on('error', err => console.log('حدث خطأ:', err));
}

createBot();

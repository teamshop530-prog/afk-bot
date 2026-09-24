const http = require('http');
http.createServer((req, res) => res.end('Bot is running!')).listen(process.env.PORT || 3000);
const mineflayer = require('mineflayer');


function createBot() {
    const bot = mineflayer.createBot({
        host: 'voidsmp2103912381230.falixsrv.me',     
        port: 23499,                
        username: 'AFK_247'     
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت للسيرفر!');

        // 1. التسجيل أو تسجيل الدخول تلقائياً في البلجن (AuthMe/nLogin)
        setTimeout(() => {
            // اكتب كلمة السر التي تريد للبوت استخدامها بدلاً من 12345678
            bot.chat('/register 12345678 12345678'); 
            bot.chat('/login 12345678');
        }, 2000);

        // 2. البدء بالحركة والقفز العشوائي كل 3 ثوانٍ
        setInterval(() => {
            const moves = ['forward', 'back', 'left', 'right'];
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            
            bot.setControlState(randomMove, true);
            bot.setControlState('jump', Math.random() < 0.5);

            setTimeout(() => {
                bot.clearControlStates();
            }, 1000);
        }, 3000);
    });

    // إعادة الاتصال تلقائياً عند انقطاعه
    bot.on('end', () => {
        console.log('انقطع الاتصال، جاري إعادة المحاولة خلال 10 ثوانٍ...');
        setTimeout(createBot, 10000);
    });

    bot.on('error', err => console.log('خطأ:', err));
}

createBot();

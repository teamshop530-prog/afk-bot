const http = require('http');
http.createServer((req, res) => res.end('Bot is Active!')).listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'voidsmp2103912381230.falixsrv.me',
        port: 23499,                // البورت
        username: 'AFK_Bot_247'     // اسم البوت
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت للسيرفر!');

        setTimeout(() => {
            bot.chat('/register 12345678 12345678'); 
            bot.chat('/login 12345678');
        }, 2000);

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

    bot.on('end', () => {
        console.log('انقطع الاتصال، جاري إعادة المحاولة...');
        setTimeout(createBot, 10000);
    });

    bot.on('error', err => console.log('خطأ:', err));
}

createBot();

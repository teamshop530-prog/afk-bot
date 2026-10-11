const http = require('http');
const mineflayer = require('mineflayer');
const mc = require('minecraft-protocol');

http.createServer((req, res) => res.end('AFK Bot is Online 24/7!')).listen(process.env.PORT || 8080);

const host = 'pixelcraftverse23166456456.mcsh.io';
const port = 25565;

let bot = null;
let moveInterval = null;

function wakeUpServer() {
    console.log('جاري إرسال Ping لإيقاظ السيرفر...');
    
    mc.ping({ host: host, port: port, version: '1.21.1' }, (err, response) => {
        if (err) {
            console.log('السيرفر مغلق حالياً، إعادة المحاولة خلال 10 ثوانٍ...');
            setTimeout(wakeUpServer, 10000);
        } else {
            console.log('السيرفر استيقظ! جاري دخول البوت...');
            setTimeout(startBot, 3000); // مهلة صغيرة لتفريغ الجلسة المعلقة
        }
    });
}

function startBot() {
    if (bot) {
        try { bot.quit(); } catch (e) {}
        bot.removeAllListeners();
        bot = null;
    }
    if (moveInterval) clearInterval(moveInterval);

    bot = mineflayer.createBot({
        host: host,
        port: port,
        username: 'AFK_Bot_247',
        version: '1.21.1',
        hideErrors: true
    });

    bot.on('death', () => {
        console.log('مات البوت، جاري الإحياء...');
        bot.respawn();
    });

    bot.on('messagestr', (message) => {
        const msg = message.toLowerCase();
        if (msg.includes('register')) {
            bot.chat('/register 12345678 12345678');
        } else if (msg.includes('login')) {
            bot.chat('/login 12345678');
        }
    });

    bot.on('spawn', () => {
        console.log('تم دخول البوت واستقراره بنجاح!');

        moveInterval = setInterval(() => {
            if (!bot || !bot.entity) return;

            const controls = ['forward', 'back', 'left', 'right'];
            const randomControl = controls[Math.floor(Math.random() * controls.length)];

            bot.setControlState(randomControl, true);
            if (Math.random() > 0.5) bot.setControlState('sprint', true);
            if (Math.random() > 0.7) bot.setControlState('sneak', true);
            if (Math.random() > 0.4) bot.setControlState('jump', true);

            const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
            const pitch = (Math.random() * 180 - 90) * (Math.PI / 180);
            bot.look(yaw, pitch, true);

            setTimeout(() => {
                if (bot && bot.entity) bot.clearControlStates();
            }, 1000);

        }, 3000);
    });

    bot.on('kicked', (reason) => {
        console.log('تم طرد البوت:', JSON.stringify(reason));
    });

    bot.on('error', (err) => {
        console.log('خطأ اتصال:', err.message);
    });

    bot.on('end', () => {
        console.log('انقطع الاتصال. الانتظار لتفريغ الجلسة وإعادة المحاولة...');
        if (moveInterval) clearInterval(moveInterval);
        setTimeout(wakeUpServer, 15000); // زيادة وقت الانتظار قليلاً لضمان خروج الجلسة القديمة من السيرفر
    });
}

process.on('uncaughtException', (err) => console.log('خطأ:', err.message));
process.on('unhandledRejection', (err) => console.log('رفض:', err));

wakeUpServer();

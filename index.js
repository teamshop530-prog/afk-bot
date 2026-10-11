const http = require('http');
const mineflayer = require('mineflayer');
const mc = require('minecraft-protocol');

// سيرفر ويب للحفاظ على الاستضافة شغال
http.createServer((req, res) => res.end('AFK Bot is Online 24/7!')).listen(process.env.PORT || 8080);

const host = 'pixelcraftverse23166456456.mcsh.io';
const port = 25565;

let bot = null;
let moveInterval = null;

// دالة لفحص وإيقاظ السيرفر (مثل زر التحديث في قائمة السيرفرات)
function wakeUpServer() {
    console.log('جاري إرسال Ping لإيقاظ السيرفر...');
    
    mc.ping({
        host: host,
        port: port,
        version: '1.21.11'
    }, (err, response) => {
        if (err) {
            console.log('السيرفر مغلق حالياً، جاري إعادة المحاولة في غضون 10 ثوانٍ...');
            setTimeout(wakeUpServer, 10000);
        } else {
            console.log('السيرفر استيقظ! عدد اللاعبين:', response.players.online);
            // السيرفر فتح، نبدأ ندخل البوت
            startBot();
        }
    });
}

function startBot() {
    console.log('جاري دخول البوت إلى السيرفر...');

    if (bot) {
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

    bot.on('kicked', (reason) => console.log('تم الطرد:', JSON.stringify(reason)));
    
    bot.on('error', (err) => {
        console.log('خطأ في اتصال البوت:', err.message);
    });

    // لو انقطع الاتصال، نرجع لخطوة الـ Ping عشان لو الاستضافة قفلت تفتح تاني
    bot.on('end', () => {
        console.log('انقطع الاتصال بالسيرفر. العودة لفحص الحالة وإيقاظه...');
        if (moveInterval) clearInterval(moveInterval);
        setTimeout(wakeUpServer, 10000);
    });
}

process.on('uncaughtException', (err) => console.log('خطأ غير متوقع:', err.message));
process.on('unhandledRejection', (err) => console.log('رفض غير معالج:', err));

// بدء العملية بفحص وإيقاظ السيرفر
wakeUpServer();

const http = require('http');
const mineflayer = require('mineflayer');
const mc = require('minecraft-protocol');

const host = 'voidsmpdark.play.hosting';
const port = 58069;

let bot = null;
let moveInterval = null;
let isBotActive = true; // البوت يبدأ شغال تلقائياً أول ما السيرفر يفتح

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/stop') {
        isBotActive = false;
        console.log('تم طلب إيقاف البوت عبر لوحة التحكم...');
        stopBot();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, status: 'stopped' }));
    } else if (req.method === 'POST' && req.url === '/api/start') {
        isBotActive = true;
        console.log('تم طلب تشغيل البوت عبر لوحة التحكم...');
        if (!bot) wakeUpServer();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, status: 'started' }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>لوحة التحكم في البوت</title>
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); text-align: center; width: 300px; }
        button { padding: 12px 24px; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; margin-top: 15px; width: 100%; }
        .stop { background: #ef4444; color: white; }
        .stop:hover { background: #dc2626; }
        .start { background: #22c55e; color: white; }
        .start:hover { background: #16a34a; }
        #status { margin-bottom: 15px; font-size: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="card">
        <h2>تحكم في البوت</h2>
        <div id="status">الحالة: <span id="statusText" style="color: #22c55e;">يعمل</span></div>
        <button id="toggleBtn" class="stop" onclick="toggleBot()">إيقاف البوت</button>
    </div>

    <script>
        let isRunning = true;
        function toggleBot() {
            isRunning = !isRunning;
            const btn = document.getElementById('toggleBtn');
            const statusText = document.getElementById('statusText');
            if (isRunning) {
                btn.textContent = 'إيقاف البوت';
                btn.className = 'stop';
                statusText.textContent = 'يعمل';
                statusText.style.color = '#22c55e';
                fetch('/api/start', { method: 'POST' });
            } else {
                btn.textContent = 'تشغيل البوت';
                btn.className = 'start';
                statusText.textContent = 'متوقف';
                statusText.style.color = '#ef4444';
                fetch('/api/stop', { method: 'POST' });
            }
        }
    </script>
</body>
</html>`);
    }
});

server.listen(process.env.PORT || 8080);

function wakeUpServer() {
    if (!isBotActive) return;
    console.log('جاري إرسال Ping لإيقاظ السيرفر...');
    
    mc.ping({ host: host, port: port, version: '1.21.1' }, (err) => {
        if (!isBotActive) return;
        if (err) {
            setTimeout(wakeUpServer, 10000);
        } else {
            console.log('السيرفر استيقظ! جاري دخول البوت...');
            setTimeout(startBot, 3000);
        }
    });
}

function startBot() {
    if (!isBotActive) return;
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
        if (isBotActive) bot.respawn();
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
            if (!bot || !bot.entity || !isBotActive) return;

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

    bot.on('end', () => {
        if (moveInterval) clearInterval(moveInterval);
        if (isBotActive) {
            setTimeout(wakeUpServer, 15000);
        }
    });
}

function stopBot() {
    if (moveInterval) clearInterval(moveInterval);
    if (bot) {
        try { bot.quit(); } catch (e) {}
        bot.removeAllListeners();
        bot = null;
    }
    console.log('تم إيقاف البوت تماماً.');
}

// بدء التشغيل تلقائياً عند فتح السيرفر
wakeUpServer();

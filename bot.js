const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const autoeat = require('mineflayer-autoeat').plugin;
const http = require('http');

// tạo máy thở cho render
http.createServer((req, res) => { res.write("Bot Supreme v5 Online!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(autoeat);

    bot.on('spawn', () => {
        console.log('===> BOT SUPREME DA SAN SANG: PARKOUR + PVP + AFK <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // kích hoạt full kỹ năng di chuyển thông minh
        movements.canSwim = true;         // biết bơi
        movements.allowSprinting = true; // biết chạy nhanh
        movements.allowParkour = true;   // biết nhảy xa qua hố (parkour)
        movements.canDig = true;         // biết đào block nếu bị kẹt
        movements.allowFreeMotion = true; // di chuyển mượt hơn
        
        bot.pathfinder.setMovements(movements);

        // chu kỳ đi dạo chống afk mỗi 15 giây
        setInterval(() => {
            if (bot.pathfinder.isMoving() || bot.pvp.target) return;
            const rx = Math.floor(Math.random() * 20) - 10;
            const rz = Math.floor(Math.random() * 20) - 10;
            const goal = new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 1);
            bot.pathfinder.setGoal(goal);
        }, 15000);
    });

    // tự động nhảy khi dưới nước để không chết đuối
    bot.on('physicsTick', () => {
        if (bot.entity.isInWater) bot.setControlState('jump', true);
    });

    // chiến thần pvp: ai đụng là chạm
    bot.on('attacked', (entity) => {
        if (entity && entity.type !== 'player') { // tự vệ trước quái
             bot.pvp.attack(entity);
        } else if (entity && entity.type === 'player') {
             bot.chat("đừng chạm vào tôi!");
             bot.pvp.attack(entity);
        }
    });

    bot.on('death', () => {
        console.log('Bot bị tiêu diệt, đang hồi sinh...');
        bot.respawn();
    });

    bot.on('end', () => {
        console.log('Mất kết nối server, đang vào lại sau 10s...');
        setTimeout(initbot, 10000);
    });

    // xử lý lỗi vặt để không sập bot
    bot.on('error', (err) => console.log('Lỗi nhẹ: ' + err));
};

initbot();

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

http.createServer((req, res) => { res.write("Bot v13 Muot Ma!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_v13',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V13: TU CHU - SINH TON - KHONG LAG <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        movements.canSwim = true;
        movements.allowParkour = true;
        bot.pathfinder.setMovements(movements);

        // di chuyển tự chủ, mượt mà (yêu cầu 1, 2, 11)
        const autoMove = () => {
            if (bot.pvp.target) return;
            const rx = Math.floor(Math.random() * 20) - 10;
            const rz = Math.floor(Math.random() * 20) - 10;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 2));
        };
        setInterval(() => { if (!bot.pathfinder.isMoving()) autoMove(); }, 8000);

        // chat 3 giây giữ kết nối (yêu cầu 8)
        setInterval(() => { bot.chat("bot v13 dang tu sinh ton..."); }, 3000);
    });

    bot.on('attacked', (e) => { if (e) bot.pvp.attack(e); }); // phản công (yêu cầu 3)
    bot.on('health', () => { // tự ăn (yêu cầu 4)
        if (bot.food < 15) {
            const food = bot.inventory.items().find(i => ['bread', 'apple', 'cooked_beef'].includes(i.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    bot.on('end', () => setTimeout(initbot, 5000)); // tự vào lại (yêu cầu 5)
};
initbot();

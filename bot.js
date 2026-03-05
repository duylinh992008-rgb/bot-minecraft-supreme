const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const http = require('http');

http.createServer((req, res) => { res.write("Bot Supreme Online!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);

    bot.on('spawn', () => {
        console.log('===> BOT DA ONLINE - FULL KYNANG <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        movements.canSwim = true;
        movements.allowParkour = true;
        bot.pathfinder.setMovements(movements);

        setInterval(() => {
            if (bot.pathfinder.isMoving() || bot.pvp.target) return;
            const rx = Math.floor(Math.random() * 10) - 5;
            const rz = Math.floor(Math.random() * 10) - 5;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 1));
        }, 15000);
    });

    bot.on('health', () => {
        if (bot.food < 15) {
            const food = bot.inventory.items().find(item => item.name.includes('bread') || item.name.includes('cooked'));
            if (food) bot.eat(food);
        }
    });

    bot.on('attacked', (entity) => { if (entity) bot.pvp.attack(entity); });
    bot.on('death', () => bot.respawn());
    bot.on('end', () => setTimeout(initbot, 10000));
};

initbot();

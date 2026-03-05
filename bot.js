const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

http.createServer((req, res) => { res.write("Bot v14 Fixed!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_v14',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V14 ONLINE: DA FIX LOI GO LENH <===');
        // không cần bot gõ lệnh nữa, ní đã tắt bằng dấu x đỏ trên web rồi
    });

    // di chuyển mượt mà liên tục (yêu cầu 1)
    setInterval(() => {
        if (!bot.pathfinder.isMoving()) {
            const rx = Math.floor(Math.random() * 20) - 10;
            const rz = Math.floor(Math.random() * 20) - 10;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 2));
        }
    }, 10000);

    bot.on('end', () => setTimeout(initbot, 5000));
};
initbot();

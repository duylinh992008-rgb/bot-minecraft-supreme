const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

// 6. chống render ngủ quên
http.createServer((req, res) => { res.write("Bot Survival V7 Online!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V7: SINH TON & XAY DUNG <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // 1 & 2. di chuyển mượt mà, vượt vật cản
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.canDig = true; // bật lại để nó biết đào đất/đá khi sinh tồn
        bot.pathfinder.setMovements(movements);

        // hàm di chuyển liên tục không nghỉ
        const roam = () => {
            const rx = Math.floor(Math.random() * 30) - 15;
            const rz = Math.floor(Math.random() * 30) - 15;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 1));
        };
        bot.on('goal_reached', () => setTimeout(roam, 100));
        roam();

        // 8. 3 giây chat ngẫu nhiên
        const talks = ["đang đi farm đồ nè", "ai xây nhà chung không?", "bot mà sinh tồn như thật luôn", "đừng phá nhà tui nha"];
        setInterval(() => { bot.chat(talks[Math.floor(Math.random() * talks.length)]); }, 3000);

        // 10. demo hành động sinh tồn (tự tìm gỗ nếu thấy gần đó)
        setInterval(() => {
            const log = bot.findBlock({ matching: block => block.name.includes('log'), maxDistance: 10 });
            if (log && !bot.pathfinder.isMoving()) {
                bot.collectBlock.collect(log).catch(() => {});
            }
        }, 20000);
    });

    // 3. phản công gắt
    bot.on('attacked', (entity) => { if (entity) bot.pvp.attack(entity); });

    // 4. tự ăn hồi sức
    bot.on('health', () => {
        if (bot.food < 18) {
            const food = bot.inventory.items().find(i => ['bread', 'cooked_beef', 'apple', 'carrot'].includes(i.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5 & 9. chống sập, tự vào lại sau 5s
    bot.on('death', () => bot.respawn());
    bot.on('end', () => {
        console.log('mất kết nối, đang hồi sinh sau 5s...');
        setTimeout(initbot, 5000);
    });

    // 7. chống lỗi vặt
    bot.on('error', (err) => {});
    bot.on('kicked', (reason) => console.log('bị kick vì: ' + reason));
};

initbot();

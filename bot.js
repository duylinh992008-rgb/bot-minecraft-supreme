const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

// 6. chống render ngủ quên (giữ kết nối 24/7)
http.createServer((req, res) => { res.write("Bot Optimized v13 Active!"); res.end(); }).listen(10000);

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
        console.log('===> BOT V13: TOI UU HOA - CHONG LAG <===');
        
        // 9. tắt thông báo hệ thống để server không phải xử lý text thừa
        bot.chat('/gamerule sendCommandFeedback false');
        bot.settings.chat = 'commandsOnly';

        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // cấu hình di chuyển mượt nhưng không ngốn cpu
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.canDig = false; // tạm tắt đào block để tránh lag chunk
        bot.pathfinder.setMovements(movements);

        // 1, 2, 11, 12. tự chủ di chuyển có khoảng nghỉ
        const smartRoam = () => {
            if (bot.pvp.target) return;
            
            // chỉ chọn điểm di chuyển trong bán kính nhỏ để tránh load chunk mới
            const rx = Math.floor(Math.random() * 20) - 10;
            const rz = Math.floor(Math.random() * 20) - 10;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 2));
        };

        // tăng thời gian nghỉ giữa các lần di chuyển để server "thở"
        setInterval(() => {
            if (!bot.pathfinder.isMoving()) smartRoam();
        }, 8000); 

        // 13. mục tiêu phá đảo: chỉ quét tìm đồ rơi mỗi 20 giây một lần
        setInterval(() => {
            const item = bot.nearestEntity(e => e.name === 'item');
            if (item && bot.entity.position.distanceTo(item.position) < 10) {
                bot.collectBlock.collect(item).catch(() => {});
            }
        }, 20000);
    });

    // 3. phản công khi bị tấn công (giữ nguyên độ nhạy)
    bot.on('attacked', (entity) => {
        if (entity) bot.pvp.attack(entity);
    });

    // 4. tự ăn khi thực sự đói
    bot.on('health', () => {
        if (bot.food < 14) {
            const food = bot.inventory.items().find(i => ['cooked_beef', 'bread', 'apple'].includes(i.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5, 8. chống văng và tự vào lại sau 5s
    bot.on('death', () => bot.respawn());
    bot.on('end', () => setTimeout(initbot, 5000));

    bot.on('error', () => {}); // 7. chống lỗi vặt
};

initbot();

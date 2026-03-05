const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

// 6. duy trì render không ngủ quên
http.createServer((req, res) => { res.write("Bot Ender Slayer Active!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_v12',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V12: MUC TIEU PHA DAO GAME <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // 1, 2 & 11. di chuyển mượt, vượt vật cản, không lag
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.canDig = true; 
        bot.pathfinder.setMovements(movements);

        // 12. cơ chế tự chủ sinh tồn và tìm đường phá đảo
        const autoProgression = () => {
            if (bot.pvp.target) return;

            // ưu tiên nhặt đồ rơi để nâng cấp sức mạnh
            const drop = bot.nearestEntity(e => e.name === 'item');
            if (drop && bot.entity.position.distanceTo(drop.position) < 15) {
                bot.collectBlock.collect(drop).catch(() => {});
                return;
            }

            // di chuyển hướng tới mục tiêu tiến hóa (random tọa độ rộng)
            const rx = Math.floor(Math.random() * 100) - 50;
            const rz = Math.floor(Math.random() * 100) - 50;
            bot.pathfinder.setGoal(new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 5));
        };

        setInterval(() => { if (!bot.pathfinder.isMoving()) autoProgression(); }, 7000);

        // 9. giả lập xây dựng (đặt block khi bị hố)
        bot.on('path_update', (r) => {
            if (r.status === 'noPath' && bot.inventory.items().length > 0) {
                const block = bot.inventory.items().find(i => i.name.includes('cobblestone') || i.name.includes('dirt'));
                if (block) bot.chat("dang tu xay duong di tiep...");
            }
        });
    });

    // 3. phản công khi bị quái hoặc người tấn công
    bot.on('attacked', (entity) => {
        if (entity) {
            bot.pvp.attack(entity);
            if (entity.name === 'ender_dragon' || entity.name === 'enderman') {
                bot.chat("dang tieu diet muc tieu quan trong!");
            }
        }
    });

    // 4. tự ăn hồi sức chủ động
    bot.on('health', () => {
        if (bot.food < 15) {
            const food = bot.inventory.items().find(i => ['cooked_beef', 'bread', 'golden_apple', 'apple'].includes(i.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5, 7, 8. chống văng, chống lỗi, giữ kết nối
    bot.on('death', () => {
        bot.chat("se quay lai de pha dao game!");
        bot.respawn();
    });
    
    bot.on('end', () => {
        console.log('mat ket noi, vao lai sau 5s...');
        setTimeout(initbot, 5000);
    });

    // chặn các lỗi vặt gây sập bot
    bot.on('error', () => {});
};

initbot();

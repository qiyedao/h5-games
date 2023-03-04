window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = this.window.innerWidth;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;

            window.addEventListener('keydown', e => {
                if (
                    (e.key == 'ArrowUp' ||
                        e.key == 'ArrowDown' ||
                        e.key == 'ArrowLeft' ||
                        e.key == 'ArrowRight') &&
                    this.game.keys.indexOf(e.key) === -1
                ) {
                    this.game.keys.push(e.key);
                }
                if (e.key === ' ') {
                    this.game.player.shootTop();
                }
                if (e.key == 'd') {
                    this.game.debug = true;
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.includes(e.key)) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 20;
            this.height = 6;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
            this.sx = 0;
            this.sy = 0;
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) {
                this.markedForDeletion = true;
            }
            // this.enterPowerUp();
        }
        enterPowerUp() {
            if (this.player.powerUp) {
                this.width = 35;
                this.height = 10;
            }
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.sx = Math.floor(Math.random() * 3);
            this.sy = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 100 + 60;
        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markedForDeletion = true;
            if (this.y < this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
                this.bounced++;
                this.speedY *= -0.5;
            }
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(
                this.image,
                this.sx * this.spriteSize,
                this.sy * this.spriteSize,
                this.spriteSize,
                this.spriteSize,
                this.size * -0.5,
                this.size * -0.5,
                this.size,
                this.size
            );
            context.restore();
        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;

            this.sx = 0;
            this.sy = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.speedX = 0;
            this.maxSpeed = 5;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;

            if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
            else this.speedX = 0;
            this.y += this.speedY;
            this.x += this.speedX;

            if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;
            if (this.y < 0) this.y = 0;

            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.sy = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.sy = 1;
                    this.game.ammo += 0.1;
                }
            } else {
                this.game.ammo = 20;
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.game.ammo = this.game.maxAmmo;
            this.powerUp = true;
        }
        draw(context) {
            context.drawImage(
                this.image,
                this.sx * this.width,
                this.sy * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            if (this.sx < this.maxFrame) {
                this.sx++;
            } else {
                this.sx = 0;
            }
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                // console.log(this.projectiles);
                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedx = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.sx = 0;
            this.sy = 0;

            this.maxFrame = 39;
        }
        update() {
            this.x += this.speedx;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            if (this.sx < this.maxFrame) {
                this.sx++;
            } else {
                this.sx = 0;
            }
        }
        draw(context) {
            context.drawImage(
                this.image,
                this.sx * this.width,
                this.sy * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
            context.save();
            console.log('this.game.debug', this.game.debug);

            if (this.game.debug) {
                // context.strokeRect(this.x, this.y, 5 * this.lives, 20);
                for (let i = 0; i < this.lives; i++) {
                    context.fillStyle = 'red';
                    context.fillRect(this.x + 5 * i, this.y, 3, 20);
                }
            }

            context.restore();
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.sy = Math.floor(Math.random() * 3);
        }
    }
    class Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.sy = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.sy = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update() {
            if (this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(game, this.image1, 0.2);
            this.layer2 = new Layer(game, this.image2, 0.4);
            this.layer3 = new Layer(game, this.image3, 1);
            this.layer4 = new Layer(game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
            // this.layers = [this.layer1];
        }
        update() {
            this.layers.forEach(layer => layer.update());
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;

            //score
            context.fillText(`score: ${this.game.score}`, 20, 40);

            // context.fillText(this.game.ammo.length, 20 + 5 * this.game.ammo.length, 50, 3, 20);

            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);

            //game over
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let messgae1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    messgae1 = 'You Win';
                    message2 = 'Well done';
                } else {
                    messgae1 = 'You lose';
                    message2 = 'Try again';
                }
                context.font = '50px' + this.fontFamily;
                context.fillText(messgae1, this.game.width * 0.5, this.game.height * 0.5);
                context.font = '25px' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 50);
            }
            //ammo
            context.fillStyle = this.color;
            if (this.game.player.powerUp) context.fillStyle = '#ffffbd';
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.restore();
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];

            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500; //ms 增加一次弹药数量

            this.enemyTimer = 0;
            this.enemyInterval = 500; //ms 增加一次敌人
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 1000 * 60 * 5;
            this.speed = 1;
            this.debug = false;
        }
        update(deltaTime) {
            if (!this.gameOver) {
                this.gameTime += deltaTime;
            }
            if (this.gameTime > this.timeLimit) {
                this.gameOver = true;
            }
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);

            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    for (let i = 0; i < 10; i++) {
                        this.particles.push(
                            new Particle(
                                this,
                                enemy.x + enemy.width + 0.5,
                                enemy.y + enemy.height + 0.5
                            )
                        );
                    }
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        if (enemy.type == 'lucky') this.player.enterPowerUp();
                        else this.score--;
                        projectile.markedForDeletion = true;
                        this.particles.push(
                            new Particle(
                                this,
                                enemy.x + enemy.width + 0.5,
                                enemy.y + enemy.height + 0.5
                            )
                        );
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                            for (let i = 0; i < 10; i++) {
                                this.particles.push(
                                    new Particle(
                                        this,
                                        enemy.x + enemy.width + 0.5,
                                        enemy.y + enemy.height + 0.5
                                    )
                                );
                            }
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.particles.forEach(particle => {
                particle.draw(context);
            });

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });

            this.background.layer4.draw(context);
        }
        addEnemy() {
            const randomSize = Math.random();
            if (randomSize < 0.3) {
                this.enemies.push(new Angler1(this));
            } else if (randomSize < 0.5) {
                this.enemies.push(new Angler2(this));
            } else {
                this.enemies.push(new LuckyFish(this));
            }
            // console.log(this.enemies);
        }
        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});

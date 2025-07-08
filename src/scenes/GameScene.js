import ScenarioManager from '../core/ScenarioManager.js';
import SoundManager from '../core/SoundManager.js';
import StateManager from '../core/StateManager.js';
import MessageWindow from '../ui/MessageWindow.js';
import { Layout } from '../core/Layout.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
import { handleCharaMod } from '../handlers/chara_mod.js';
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js';
import { handleBg } from '../handlers/bg.js';
import { handlePlaySe } from '../handlers/playse.js';
import { handlePlayBgm } from '../handlers/playbgm.js';
import { handleStopBgm } from '../handlers/stopbgm.js';
import { handleLink } from '../handlers/link.js';
import { handleJump } from '../handlers/jump.js';
import { handleMove } from '../handlers/move.js';
import { handleWalk } from '../handlers/walk.js';
import { handleShake } from '../handlers/shake.js';
import { handleVibrate } from '../handlers/vibrate.js';
import { handleFlip } from '../handlers/flip.js';
import { handleCharaJump } from '../handlers/chara_jump.js';
import { handleEval } from '../handlers/eval.js';
import { handleLog } from '../handlers/log.js';
import { handleIf } from '../handlers/if.js';
import { handleElsif } from '../handlers/elsif.js';
import { handleElse } from '../handlers/else.js';
import { handleEndif } from '../handlers/endif.js';
import { handleStop } from '../handlers/s.js';
import { handleClearMessage } from '../handlers/cm.js';
import { handleErase } from '../handlers/er.js';
import { handleDelay } from '../handlers/delay.js';
import { handleImage } from '../handlers/image.js';
import { handleFreeImage } from '../handlers/freeimage.js';
// import { handleButton } from '../handlers/button.js'; // button.jsが未作成ならコメントアウト
import { handleCall } from '../handlers/call.js';
import { handleReturn } from '../handlers/return.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        // --- プロパティの初期化 ---
        this.scenarioManager = null;
        this.soundManager = null;
        this.stateManager = null;
        this.messageWindow = null;
        this.configManager = null; // GameSceneでは直接使わないが、他へ渡すために保持
        this.layer = { background: null, character: null, cg: null, message: null };
        this.charaDefs = null;
        this.characters = {};
        this.choiceButtons = [];
        this.pendingChoices = [];
    }

    init(data) {
        this.charaDefs = data.charaDefs;
    }

    preload() {
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        console.log("GameScene: create 開始");
        this.cameras.main.setBackgroundColor('#000000');
        
        // --- レイヤー生成 ---
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.cg = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        // --- マネージャー/UIクラスの生成と配置 ---
        this.configManager = this.sys.game.config.globals.configManager;
        this.stateManager = new StateManager();
        this.soundManager = new SoundManager(this, this.configManager);
        this.messageWindow = new MessageWindow(this, this.soundManager, this.configManager);
        
        // MessageWindowの位置をLayout.jsから設定
        const mwLayout = Layout.ui.messageWindow;
        this.messageWindow.setPosition(mwLayout.x, mwLayout.y);
        this.layer.message.add(this.messageWindow);
        
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow, this.soundManager, this.stateManager, this.configManager);
        
        // --- タグハンドラの登録 ---
        // (あなたのコードにあった全タグをここに記述)
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('chara_mod', handleCharaMod);
        this.scenarioManager.registerTag('p', handlePageBreak);
        this.scenarioManager.registerTag('wait', handleWait);
        this.scenarioManager.registerTag('bg', handleBg);
        this.scenarioManager.registerTag('playse', handlePlaySe);
        this.scenarioManager.registerTag('playbgm', handlePlayBgm);
        this.scenarioManager.registerTag('stopbgm', handleStopBgm);
        this.scenarioManager.registerTag('link', handleLink);
        this.scenarioManager.registerTag('jump', handleJump);
        this.scenarioManager.registerTag('move', handleMove);
        this.scenarioManager.registerTag('walk', handleWalk);
        this.scenarioManager.registerTag('shake', handleShake);
        this.scenarioManager.registerTag('vibrate', handleVibrate);
        this.scenarioManager.registerTag('flip', handleFlip);
        this.scenarioManager.registerTag('chara_jump', handleCharaJump);
        this.scenarioManager.registerTag('eval', handleEval);
        this.scenarioManager.registerTag('log', handleLog);
        this.scenarioManager.registerTag('if', handleIf);
        this.scenarioManager.registerTag('elsif', handleElsif);
        this.scenarioManager.registerTag('else', handleElse);
        this.scenarioManager.registerTag('endif', handleEndif);
        this.scenarioManager.registerTag('s', handleStop);
        this.scenarioManager.registerTag('cm', handleClearMessage);
        this.scenarioManager.registerTag('er', handleErase);
        this.scenarioManager.registerTag('delay', handleDelay);
        this.scenarioManager.registerTag('image', handleImage);
        this.scenarioManager.registerTag('freeimage', handleFreeImage);
        // this.scenarioManager.registerTag('button', handleButton); // button.jsが未作成ならコメントアウト
        this.scenarioManager.registerTag('call', handleCall);
        this.scenarioManager.registerTag('return', handleReturn);

        // --- ゲーム開始 ---
        this.scenarioManager.load('scene1');
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });
        setTimeout(() => {
            this.scenarioManager.next();
        }, 10); // 10ミリ秒後。ほぼ0秒後だが、createの同期処理を抜けるのに十分
        console.log("GameScene: create 完了");
    }

    performSave(slot) {
        try {
            const gameState = this.stateManager.getState();
            gameState.saveDate = new Date().toLocaleString();
            const jsonString = JSON.stringify(gameState);
            localStorage.setItem(`save_data_${slot}`, jsonString);
            console.log(`スロット[${slot}]にセーブしました。`, gameState);
        } catch (e) {
            console.error(`セーブに失敗しました: スロット[${slot}]`, e);
        }
    }

    async performLoad(slot) {
        try {
            const jsonString = localStorage.getItem(`save_data_${slot}`);
            if (!jsonString) {
                console.warn(`スロット[${slot}]にセーブデータがありません。`);
                return;
            }
            const loadedState = JSON.parse(jsonString);
            
            rebuildScene(this, loadedState); // ★★★ 引数をthisとstateに変更 ★★★
            
            // ロードが完了したら、保存された行からシナリオを再開
            this.scenarioManager.next();
            
        } catch (e) {
            console.error(`ロード処理でエラーが発生しました。`, e);
        }
    }

    displayChoiceButtons() {
        const totalButtons = this.pendingChoices.length;
        const startY = (720 / 2) - ((totalButtons - 1) * 60);

        this.pendingChoices.forEach((choice, index) => {
            const y = startY + (index * 120);
            const button = this.add.text(1280 / 2, y, choice.text, { fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 }})
                .setOrigin(0.5)
                .setInteractive();
        
            button.on('pointerdown', () => {
                this.clearChoiceButtons();
                this.scenarioManager.jumpTo(choice.target);
                this.scenarioManager.next();
            });
            this.choiceButtons.push(button);
        });
        this.pendingChoices = [];
    }
 
    clearChoiceButtons() {
        this.choiceButtons.forEach(button => button.destroy());
        this.choiceButtons = [];
        if (this.scenarioManager) {
            this.scenarioManager.isWaitingChoice = false;
        }
    }
}

/**
 * ロードした状態に基づいて、シーンの表示を再構築するヘルパー関数
 */
function rebuildScene(scene, state) {
    console.log("--- rebuildScene 開始 ---");
    const manager = scene.scenarioManager;

    // 1. クリア処理
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();

    // 2. シナリオ復元
    manager.stateManager.setState(state);
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    if (!scene.cache.text.has(manager.currentFile)) throw new Error(`シナリオ[${manager.currentFile}]未発見`);
    const rawText = scene.cache.text.get(manager.currentFile);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    // 3. 背景復元
    if (state.layers.background) {
        if (!scene.textures.exists(state.layers.background)) throw new Error(`背景[${state.layers.background}]未発見`);
        const bg = scene.add.image(640, 360, state.layers.background);
        manager.layers.background.add(bg);
    }
    
    // 4. キャラクター復元
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        if (!scene.textures.exists(charaData.storage)) throw new Error(`キャラ[${charaData.storage}]未発見`);
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        chara.setData('pos', charaData.pos);
        chara.setTint(0xffffff);
        manager.layers.character.add(chara);
        scene.characters[name] = chara;
    }

    // 5. BGM復元
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    
    // 6. UIリセット
    manager.messageWindow.setText('');
    manager.highlightSpeaker(null);
    
    console.log("--- rebuildScene 正常終了 ---");
}
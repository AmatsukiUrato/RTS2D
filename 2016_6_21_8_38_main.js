/* ToDo(⑤>>>>>優先順位>>>>>①)
 * ④敵ユニットと出会うと戦うようにする
 * ③オブジェクト(自陣のタワー，トラップなど)を用意する
 * ②三番目のメニューのアイコンからu.chooseをアクティブにする
 * ②ユニット同士の当たり判定を入れる
 * ③player1,2でユニットやオブジェクトの判定を分ける
 * ①通信対戦できるようにする
 */

/* 完了
 * ⑤別のユニットをクリックすると前のu.chooseを無効化する
 * ⑤選択した時に前のクリック状態が保持されているのをリセット
 * ④別のユニットを移動させても他の移動が止まらないようにする
 */

var W = 800, //canvasの幅を指定
    H = 450, //canvasの高さを指定
    BLOCK = 20, // 1マスの幅
    PLAYER1 = 1, // プレイヤーの値
    PLAYER2 = 2,
    canvas = document.getElementById('canvas'), // canvasを取得
    ctx, // contextの生成
    timer, // setInterval用
    units = [], // ユニット用
    setIntervalTime = 50, // setIntervalの時間用
    manPower = 0, // 各ユニットコスト
    iron = 0,
    wood = 0,
    count = 0, // 時間測り用
    gameMainLoop; // ForLoop

// mapの幅 P=Position,X=x座標
var mapPX = 80,
    mapPY = 10,
    mapX = 640,
    mapY = 300;

// 画像の読み込み
var imgnormal = new Image(),
    imgdefender = new Image(),
    imgatacker = new Image();

    imgnormal.src = "normal.png";
    imgatacker.src = "atacker.png";
    imgdefender.src = "defender.png";

// ロードしたらキャンバスを取得する
window.onload = function(){
    // canvasの幅の生成
    canvas.width = W;
    canvas.height = H;

    // contextを生成する
    ctx = canvas.getContext('2d');

    // デフォルトフォントを定義
    ctx.font = "15px Arial";

    // 初期ユニットの生産
    makeUnits("normal",1,PLAYER1); //normal
    makeUnits("normal",1,PLAYER1); //normal
    makeUnits("normal",1,PLAYER2); //normal
    makeUnits("normal",1,PLAYER2); //normal
};

// マウスをクリックした時
document.onmousedown = function(e) {
	// 要素の位置座標を計算
	var mouseX = e.clientX - canvas.offsetLeft, // 要素のX座標
	    mouseY = e.clientY - canvas.offsetTop;	// 要素のY座標

    for (var i = 0; i < units.length; i++) {
        var u = units[i];

        // ユニットのアクティブ判定
        // クリックした位置とユニットの位置が同じ
        if (u.posX <= mouseX &&
            u.posX+BLOCK >= mouseX &&
            u.posY <= mouseY &&
            u.posY+BLOCK >= mouseY) {
                // 選ばれていた場合
                if (u.choose) {
                    u.choose = false;

                // クリックされたユニットがまだ選ばれていない場合
                } else {
                    // 既に選ばれているかどうか(重なっていた場合の判定)
                    for (var j = 0;j < units.length; j++) {
                        var uSub = units[j];
                        // 選ばれている場合
                        if(uSub.choose) {
                            uSub.choose = false;

                        }
                    }
                    u.wantMovePoint = [u.posX+(BLOCK/2),u.posY+(BLOCK/2)];
                    u.choose = true;
                }



        //ユニットの移動判定
        } else {
            u.movePermit = true;
            // var mouse = [mouseX,mouseY];mouse;
            u.wantMovePoint = [mouseX,mouseY];
        }
    }
}

// キーを押したときの動作
document.onkeydown = function(e){
    var k = e.keyCode
    switch (k) {
        case 13: // Enter
            timer = setInterval(gameMainLoop,setIntervalTime); //GameStart 20/s
            break;
        case 27: // ESC
            clearTimeout(timer);
            document.location.reload();
            break;
        case 32: // Space
            makeUnits("normal",1,PLAYER1); //ユニットの作成
            break;
        case 65: // A
            makeUnits("atacker",1,PLAYER1); //ユニットの作成
            break;
        case 68: // D
            makeUnits("defender",1,PLAYER1); //ユニットの作成
            break;
        case 83: // s
            break;
        default:
    }
};

function Unit(width,height,hp,atk,def,range,spd,cost,eye,name,player) {
    if (player === PLAYER1) {
        this.posX = 0;
    } else {
        this.posX = mapX+mapPX+(W-mapX-mapPX);
    }
    this.posY   = mapY/2;
    this.disX   = width;
    this.disY   = height;
    this.hp     = hp;
    this.atk    = atk;
    this.def    = def;
    this.range  = range;
    this.spd    = spd;
    this.cost   = cost;
    this.eye    = eye;
    this.name   = name;
    this.player = player;
    this.choose = false; //アクティブ判定
    this.movePermit = false; // 移動の許可
    this.wantMovePoint = [this.posX,this.posY]; //行きたい座標
    this.wantMovePointed = [this.posX+(BLOCK/2),this.posY+(BLOCK/2)];
    // this.wantMovePointed  別のユニットが指定された時，前の選択ユニットが行きたかった場所
}

// function Player(player) {
//     this.player = player; // player1 or player2
// }


units.display = function() {
    var max = units.length;
    for (var i =0; i < max; i++) {
        var u = units[i];
        // ユニットの移動
        moveUnit(u,max);
        ctx.drawImage(window["img"+u.name],u.posX,u.posY,BLOCK,BLOCK);
    }
};

//ユニット移動の処理
var moveUnit = function(myUnit,unitLength) {

    //マップ外(パイプの処理)
    if (myUnit.posX < mapPX && myUnit.player === PLAYER1) {
        myUnit.posX += myUnit.spd;

    } else if (myUnit.posX > mapPX+mapX && myUnit.player === PLAYER2) {
        myUnit.posX -= myUnit.spd;

    //マップ内の処理
    //マップ内かつ固定指定
    } else if ((myUnit.posX >= mapPX) &&
               (myUnit.posX <= mapPX+mapX-BLOCK) &&
               (myUnit.posY >= mapPY) &&
               (myUnit.posY <= mapPY+mapY-BLOCK) &&
               (myUnit.movePermit) ) {
                   if (myUnit.choose) {
                       //マウスのクリックで何処に行きたいのかの判定を書く
                       //合致していない間
                       if (myUnit.posX !== myUnit.wantMovePoint[0]-(BLOCK/2) || myUnit.posY !== myUnit.wantMovePoint[1]-(BLOCK/2)) {
                           if ( myUnit.posX <= myUnit.wantMovePoint[0]-(BLOCK/2) ) {
                               myUnit.posX += myUnit.spd;
                           } else if (myUnit.posX >= myUnit.wantMovePoint[0]-(BLOCK/2)) {
                               myUnit.posX -= myUnit.spd;
                           }
                           if ( myUnit.posY < myUnit.wantMovePoint[1]-(BLOCK/2) ) {
                               myUnit.posY += myUnit.spd;
                           } else if (myUnit.posY > myUnit.wantMovePoint[1]-(BLOCK/2)) {
                               myUnit.posY -= myUnit.spd;
                           }
                           if (myUnit.wantMovePoint[0] != null) {
                               myUnit.wantMovePointed = myUnit.wantMovePoint;
                           }
                       }
                   } else {
                       if (myUnit.posX !== myUnit.wantMovePointed[0]-(BLOCK/2) || myUnit.posY !== myUnit.wantMovePointed[1]-(BLOCK/2)) {
                           if ( myUnit.posX <= myUnit.wantMovePointed[0]-(BLOCK/2) ) {
                               myUnit.posX += myUnit.spd;
                           } else if (myUnit.posX >= myUnit.wantMovePointed[0]-(BLOCK/2)) {
                               myUnit.posX -= myUnit.spd;
                           }
                           if ( myUnit.posY < myUnit.wantMovePointed[1]-(BLOCK/2) ) {
                               myUnit.posY += myUnit.spd;
                           } else if (myUnit.posY > myUnit.wantMovePointed[1]-(BLOCK/2)) {
                               myUnit.posY -= myUnit.spd;
                           }
                       }
                   }
    // マップ周りの壁判定
    } else {
        if (myUnit.posX < mapPX) {
            ++myUnit.posX;
        } else if (myUnit.posX > mapPX+mapX-BLOCK) {
            --myUnit.posX;
        } else if (myUnit.posY < mapPY) {
            ++myUnit.posY;
        } else if (myUnit.posY > mapPY+mapY-BLOCK) {
            --myUnit.posY;
        }
    }

    // for (var i = 0; i < unitLength; i++) {
    //     var otherUnit = units[i];
    //     // 他ユニットとの処理
    //     if (myUnit !== otherUnit && myUnit.choose) {
    //         if (myUnit.posY+BLOCK > otherUnit.posY &&
    //             otherUnit.posY < myUnit.posY) {
    //                 //右側が衝突した時
    //                 if (myUnit.posX+BLOCK === otherUnit.posX) {
    //                     --myUnit.posX;
    //                     console.log("右衝突");
    //                 //左側が衝突した時
    //                 } else if(myUnit.posX === otherUnit.posX+BLOCK) {
    //                     ++myUnit.posX;
    //                     console.log("左衝突");
    //                 }
    //
    //         } else if (myUnit.posX+BLOCK > otherUnit.posX &&
    //                    otherUnit.posX < myUnit.posX) {
    //                 //右側が衝突した時
    //                 if (myUnit.posY+BLOCK === otherUnit.posY) {
    //                     --myUnit.posY;
    //                     console.log("上衝突");
    //                 //左側が衝突した時
    //                 } else if (myUnit.posY === otherUnit.posY+BLOCK) {
    //                     ++myUnit.posY;
    //                     console.log("下衝突");
    //                 }
    //         }
    //     }
    // }
};

function makeUnits(name,howmany,player) {
    var newUnit;
    switch (name) {
        case "normal":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,10,2,0,1,1,20,5,"normal",player);
            }
            break;
        case "atacker":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,8,4,1,1,1,30,5,"atacker",player);
            }
            break;
        case "defender":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,12,1,4,1,1,30,5,"defender",player);
            }
            break;
        default:
            console.log("cant production;;");
    }
    newUnit.life = true;
    units.push(newUnit);
}

function battle() {
    var max = units.length;
    for(var i = 0; i < max; i++) {
        var u = units[i];
        for(var j = 0; j < max; j++) {
            var uSub = units[j];
            if (u.player !== uSub.player &&
                u.posX < uSub.posX+BLOCK &&
                uSub.posX < u.posX+BLOCK &&
                u.posY < uSub.posY+BLOCK &&
                uSub.posY < u.posY+BLOCK)
                    {
                        if (count % 10 === 1) {
                            //戦闘モード
                            var hp = u.hp + u.def - uSub.atk;
                            if (u.hp - hp >= 1) {
                                u.hp = hp;
                            } else if (1 > u.hp - hp) {
                                u.hp = u.hp - 1;
                            }
                            if (u.hp <= 0) {
                                units.splice(i, 1);
                            }
                        }
            }
        }
    }
}

function makeDisplays() {
    // メニュー
    var menuPX      = 0,
        menuPY      = mapY+mapPY*2+2,
        menuX       = W,
        menuY       = H-(mapY+mapPY*2),
        menuInfo1PX = menuPX+10,
        menuInfo2PX = menuPX+10+210,
        menuInfo3PX = menuPX+10+210+160,
        menuInfo4PX = menuPX+10+210+110+300,
        menuInfoPY  = menuPY+10;

    // 基本画面の描画
    ctx.fillStyle = "rgb(51, 42, 33)"; //上画面
    ctx.fillRect(0,0,W,mapY+mapPY*2);
    ctx.fillStyle = "rgb(74, 65, 59)"; //下画面
    ctx.fillRect(menuPX,menuPY,menuX,menuY);

    // フィールド
    ctx.fillStyle = "rgb(177, 145, 115)";
    ctx.fillRect(mapPX,mapPY,mapX,mapY);
    ctx.fillStyle = "black";
    ctx.fillRect(0,mapPY+mapY+10,W,2);

    // 陣地
    ctx.fillStyle = "rgb(228, 195, 55)";
    ctx.fillRect(mapPX,mapPY+BLOCK*4,80,140);
    ctx.fillRect(mapPX+mapX-80,mapPY+BLOCK*4,80,140);

    // マップ境界
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    for(var i = 0; i < 32;i += 2) {
        ctx.fillRect(mapPX+i*BLOCK,mapPY,BLOCK,mapY);
        if(i > 14) {continue;};
        ctx.fillRect(mapPX,mapPY+i*BLOCK,mapX,BLOCK);
    }

    // パイプ
    ctx.fillStyle = "rgb(167, 138, 63)";
    ctx.fillRect(0,(mapY/2),mapPX,20);
    ctx.fillRect(mapX+mapPX,(mapY/2),mapPX,20);

    // menuのinfo
    ctx.fillStyle = "rgb(208, 204, 200)";
    ctx.fillRect(menuInfo1PX,menuInfoPY,200,menuY-20);
    ctx.fillRect(menuInfo2PX,menuInfoPY,150,menuY-20);
    ctx.fillRect(menuInfo3PX,menuInfoPY,240,menuY-20);
    ctx.fillRect(menuInfo4PX,menuInfoPY,W-menuInfo4PX-10,menuY-20);

    // 項目表示
    ctx.textAlign = "start";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("ステータス",((menuPX+15)+(menuY-40))+20,menuPY+30);
    ctx.fillText("HP :",((menuPX+15)+(menuY-40))+25,menuPY+50);
    ctx.fillText("ATK :",((menuPX+15)+(menuY-40))+25,menuPY+65);
    ctx.fillText("DEF :",((menuPX+15)+(menuY-40))+25,menuPY+80);
    ctx.fillText("SPD :",((menuPX+15)+(menuY-40))+25,menuPY+95);
    ctx.fillText("Range :",((menuPX+15)+(menuY-40))+25,menuPY+110);

    // menu一番目の表示
    ctx.fillStyle = "rgba(168, 162, 152, 0.3)";
    ctx.fillRect(menuPX+20,menuPY+15,menuY-40,menuY-30);

    // menu二番目の表示
    ctx.textAlign = "left";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("生産材料",menuInfo2PX+10,menuPY+30);
    ctx.fillText("ManPower :",menuInfo2PX+10,menuPY+60);
    ctx.fillText("Iron :",menuInfo2PX+10,menuPY+80);
    ctx.fillText("Wood :",menuInfo2PX+10,menuPY+100);
    ctx.fillText(Math.floor(manPower),menuInfo2PX+100,menuPY+60);
    ctx.fillText(iron,menuInfo2PX+100,menuPY+80);
    ctx.fillText(wood,menuInfo2PX+100,menuPY+100);

    // menu三番目の表示
    ctx.fillText("生産したユニット",menuInfo3PX+10,menuInfoPY+20);

    // menu四番目の表示
    ctx.fillStyle = "rgba(168, 162, 152, 0.3)";
    ctx.fillRect(menuInfo4PX+10,menuInfoPY+10,40,40); // 一行一列
    ctx.fillRect(menuInfo4PX+60,menuInfoPY+10,40,40); // 一行二列
    ctx.fillRect(menuInfo4PX+110,menuInfoPY+10,40,40); // 一行三列
    ctx.fillRect(menuInfo4PX+10,menuInfoPY+60,40,40); // 二行一列
    ctx.fillRect(menuInfo4PX+60,menuInfoPY+60,40,40); // 二行二列
    ctx.fillRect(menuInfo4PX+110,menuInfoPY+60,40,40); // 二行三列

    // 判定で表示するとこ
    makeJudgeDisplays(menuPX,menuPY,menuX,menuY,menuInfo3PX);
}

function makeJudgeDisplays(menuPX,menuPY,menuX,menuY,menuInfo3PX) {
    var max = units.length;
    for(var i = 0; i < max; i++) {
        var u = units[i];
        // 選択時
        if(u.choose) {
            // アイコンクリックした時
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fillRect(u.posX,u.posY,BLOCK,BLOCK);

            // menu一番目の表示
                // アイコン拡大表示
                ctx.drawImage(window["img"+u.name],menuPX+30,menuPY+40,menuY-60,menuY-60);
                // 画像上の名前表示
                ctx.textAlign = "center";
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fillText(u.name,((menuPX+30)+((menuY-60)/2)),menuPY+30);
                //値の表示
                ctx.fillText(u.hp,((menuPX+15)+(menuY-40))+85,menuPY+50);
                ctx.fillText(u.atk,((menuPX+15)+(menuY-40))+85,menuPY+65);
                ctx.fillText(u.def,((menuPX+15)+(menuY-40))+85,menuPY+80);
                ctx.fillText(u.spd,((menuPX+15)+(menuY-40))+85,menuPY+95);
                ctx.fillText(u.range,((menuPX+15)+(menuY-40))+85,menuPY+110);

            // 移動先の表示
                if (u.wantMovePoint[0] >= mapPX &&
                    u.wantMovePoint[0] <= mapPX+mapX &&
                    u.wantMovePoint[1] >= mapPY &&
                    u.wantMovePoint[1] <= mapPY+mapY) {
                        ctx.textAlign = "start";
                        ctx.fillStyle = "rgba(20, 0, 255, 0.3)";
                        ctx.beginPath();
                        ctx.arc(u.wantMovePoint[0],u.wantMovePoint[1],BLOCK/2,0,Math.PI*2);
                        ctx.fill();
                        // ctx.fillRect(u.wantMovePoint[0]-(BLOCK/2),u.wantMovePoint[1]-(BLOCK/2),BLOCK,BLOCK);
                }
        }

        //menu三番目の表示
            if (u.life) {
                for (var j = 0; j < max; j++) {
                    if (j < 11) {
                        ctx.drawImage(window["img"+units[j].name],menuInfo3PX+5+(j*20),menuPY+40,BLOCK,BLOCK);
                    } else if (j < 22) {
                        ctx.drawImage(window["img"+units[j].name],menuInfo3PX+5+(j*20-220),menuPY+70,BLOCK,BLOCK);
                    } else if (j < 33)
                    ctx.drawImage(window["img"+units[j].name],menuInfo3PX+5+(j*20-440),menuPY+100,BLOCK,BLOCK);

                }
            }
    }
}

gameMainLoop = function(){
    count++;
    makeDisplays(); //背景の描写
    units.display();
    battle();
    manPower += 0.1;

}; //gameの始まり

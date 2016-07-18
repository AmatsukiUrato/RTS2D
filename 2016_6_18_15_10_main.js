/* ToDo(⑤>>>>>優先順位>>>>>①)
 * ②三番目のメニューのアイコンからu.chooseをアクティブにする
 * ⑤別のユニットをクリックすると前のu.chooseを無効化する
 * ②ユニット同士の当たり判定を入れる
 * ④敵ユニットと出会うと戦うようにする
 * ③オブジェクト(自陣のタワー，トラップなど)を用意する
 * ③player1,2でユニットやオブジェクトの判定を分ける
 * ①通信対戦できるようにする
 */

var W = 800, //canvasの幅を指定
    H = 450, //canvasの高さを指定
    BLOCK = 20, // 1マスの幅
    canvas = document.getElementById('canvas'), // canvasを取得
    ctx, // contextの生成
    timer, // setInterval用
    // player, //プレイヤー
    units = [], //ユニット用
    manPower = 0,
    iron = 0,
    wood = 0,
    gameMainLoop; //ForLoop

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
    makeUnits("atacker",1); //normal
};

// マウスをクリックした時
document.onmousedown = function(e) {
	// 要素の位置座標を計算
	var mouseX = e.clientX - canvas.offsetLeft, // 要素のX座標
	    mouseY = e.clientY - canvas.offsetTop;	// 要素のY座標

    for (var i = 0; i < units.length; i++) {
        var u = units[i];

        // ユニットのアクティブ判定
        if (u.posX <= mouseX &&
            u.posX+BLOCK >= mouseX &&
            u.posY <= mouseY &&
            u.posY+BLOCK >= mouseY) {
                u.choose = !u.choose;
        //ユニットの移動判定
        } else {
            u.movePermit = true;
            var mouse = [mouseX,mouseY];
            u.wantMovePoint = mouse;
        }
    }
}

// キーを押したときの動作
document.onkeydown = function(e){
    var k = e.keyCode
    switch (k) {
        case 13: // Enter
            timer = setInterval(gameMainLoop,50); //GameStart 20/s
            break;
        case 27: // ESC
            document.location.reload();
            break;
        case 32: // Space
            makeUnits("normal",1); //ユニットの作成
            break;
        case 65: // A
            makeUnits("atacker",1); //ユニットの作成
            break;
        case 68: // D
            makeUnits("defender",1); //ユニットの作成
            break;
        case 83: // s
            clearTimeout(timer);
            break;
        default:
    }
};

function Unit(width,height,hp,atk,def,range,spd,cost,eye,name) {
    this.posX   = 0;
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
    this.choose = false; //アクティブ判定
    this.movePermit = false; //
    //.posFix オブジェクト同士の被り防止判定
    //.wantMovePoint = mouse[mouseX,mouseY]移動したい場所指定
}

// function Player(player) {
//     this.player = player; // player1 or player2
// }

//ユニット移動の処理
var moveUnit = function(myUnit,unitLength) {

    // ユニットが衝突したら止める
    // for (var j = 0; j < unitLength; j++) {
    //     var subu = units[j];
    //     if (myUnit.posX < subu.posX+BLOCK &&
    //         subu.posX < myUnit.posX+BLOCK &&
    //         myUnit.posY < subu.posY+BLOCK &&
    //         subu.posY < myUnit.posY+BLOCK &&
    //         myUnit !== subu)
    //          {
    //             myUnit.posFix = true;
    //         }
    // }

    //マップ外(パイプの処理)
    if (myUnit.posX < mapPX) {
        myUnit.posX += myUnit.spd;

    //マップ内の処理
    //マップ内かつ固定指定
    } else if ((myUnit.posX >= mapPX) &&
               (myUnit.posX <= mapPX+mapX-BLOCK) &&
               (myUnit.posY >= mapPY) &&
               (myUnit.posY <= mapPY+mapY-BLOCK) &&
            //    (!myUnit.posFix) &&
               (myUnit.movePermit) && (myUnit.choose)) {
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

function makeUnits(name,howmany) {
    var newUnit;
    switch (name) {
        case "normal":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,10,2,0,1,1,20,5,"normal");
            }
            break;
        case "atacker":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,8,4,1,1,1,30,5,"atacker");
            }
            break;
        case "defender":
            for (var i = 0; i < howmany; i++) {
                newUnit = new Unit(BLOCK,BLOCK,12,1,4,1,1,30,5,"defender");
            }
            break;
        default:
            console.log("cant production;;");
    }
    newUnit.life = true;
    units.push(newUnit);
}

units.display = function() {
    var max = units.length;
    for (var i =0; i < max; i++) {
        var u = units[i];
        // ユニットの移動
        moveUnit(u,max);
        ctx.drawImage(window["img"+u.name],u.posX,u.posY,BLOCK,BLOCK);
    }
};

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
    makeDisplays(); //背景の描写
    units.display();
    manPower += 0.1;

}; //gameの始まり

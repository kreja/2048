/**
 * modal
 */

/**
 * block
 * @param {[type]} options  [可选，配置]
 * @param {[type]} oldBlock [可选，基于 oldBlock 进行配置]
 */
var Block = function(options, oldBlock) {
  Object.assign(this, {
    randomNew: false, // 是否是 random 生成的
    value: 0,
    x: 0,
    y: 0,
    nextX: 0, // 非移动状态, nextX 要跟 x 保持一致
    nextY: 0 // 非移动状态, nextY 要跟 y 保持一致
  }, oldBlock||{}, options);
}

var Grid = function(options){
  this.size = options.size;

  this.initBlocks();
}

/**
 * 初始化生成 blocks
 * @return {[type]} [description]
 */
Grid.prototype.initBlocks = function() {
  this.blocks = [];
  this.nextBlocks = []; // 移动后计算出下一步的 blocks
  this.moving = false;
  this.canMove = true;
  this.score = 0;
  this.addedScoreRecord = [];
  this.highestScore = localStorage.getItem('freezing-2048-highest-score') || 0;

  for(var r=0; r<this.size; r++){
    this.blocks[r] = [];
    for(var c=0; c<this.size; c++){
      this.blocks[r][c] = new Block({
        x: c,
        y: r,
        nextX: c,
        nextY: r
      });
    }
  }

  this.nextBlocks = [...this.blocks];
  
  return this.addRandomBlock().endMoving();
}

/**
 * 结束移动
 * nextBlocks 赋值给 blocks
 * 确保所有 (x, y) = (nextX, nextY)
 * 去掉 new 标记
 * @return {[type]} [description]
 */
Grid.prototype.endMoving = function() {
  this.moving = false;
  this.blocks = [...this.nextBlocks];

  return this;
}

/**
 * nextBlocks 空白处随机生成数字方块
 * @return {[type]} [description]
 */
Grid.prototype.addRandomBlock = function() {
  var emptyBlocks = [];

  this.nextBlocks.map((row, rowIndex) => {
    row.map((block, colIndex) => {
      if(block.value===0){
        emptyBlocks.push({
          r: rowIndex,
          c: colIndex
        });
      }
    });
  });

  var randomBlock = emptyBlocks[Math.floor( Math.random() * emptyBlocks.length )];
  this.nextBlocks[randomBlock.r][randomBlock.c] = new Block({
    value: Math.random() < 0.5 ? 2 : 4,
    x: randomBlock.c,
    y: randomBlock.r,
    nextX: randomBlock.c,
    nextY: randomBlock.r,
    randomNew: true
  });

  // 判断是否 game over，没有空格 && 相邻的都不同 -> over
  return this.checkMove();
}

/**
 * 检查是否还能移动
 * @return {[type]} [description]
 */
Grid.prototype.checkMove = function() {
  // 可以移动的情况：有空格 || 等于右边方块 || 等于下面方块
  this.canMove = this.nextBlocks.some((row, rowIndex) => 
    row.some((block, colIndex) => 
      block.value === 0
      || block.value === (this.nextBlocks[rowIndex][colIndex+1] && this.nextBlocks[rowIndex][colIndex+1].value)
      || block.value === (this.nextBlocks[rowIndex+1] && this.nextBlocks[rowIndex+1][colIndex].value)
    )
  );

  // game over 记录分数
  if(!this.canMove){
    this.score > this.highestScore && localStorage.setItem('freezing-2048-highest-score', this.score);
  }

  return this;
}

/**
 * 移动
 * 得到更新 oldBlocks 矩阵，这个矩阵的块顺序不变，value 不变，只是(nextX, nextY)改变了
 * 计算出当前块的位置变化，得到移动后的矩阵 newBlocks，(x, y)=(nextX, nextY)，并生成新的块
 * @return {[type]} dir [方向，0 -> left, 1 -> up, 2 -> right, 3 -> down]
 */
Grid.prototype.move = function(dir) {
  var me = this;
  var addedScore = 0;
  var oldBlocks = [...me.blocks];
  var newBlocks = [];
  var hasChanged = false;
  var i;
  
  // 旋转矩阵
  for(i=0; i<dir; i++){
    oldBlocks = rotateLeft(oldBlocks);
  }

  // 去掉 0, 合并相邻相等的方块
  oldBlocks.map(function(row, rowIndex){ // 一行的逻辑
    var mergedRow = [];
    var hasMerged = [];
    
    // 得到合并后的行
    row.map(function(block, colIndex){
      if(block.value!==0){
        // 前一块没有合并过 && 前一块跟这块相同，就合并
        var preBlock = mergedRow[mergedRow.length-1];
        if(preBlock && !hasMerged[mergedRow.length-1] && preBlock.value === block.value){
          mergedRow[mergedRow.length-1].value *=2;
          hasMerged[mergedRow.length-1] = true;

          addedScore += mergedRow[mergedRow.length-1].value;
        }else{
          mergedRow.push(new Block(block));
          hasMerged[mergedRow.length] = false;
        }
        
        // update nextX
        oldBlocks[rowIndex][colIndex] = new Block({nextX: mergedRow.length-1}, oldBlocks[rowIndex][colIndex]);
        mergedRow[mergedRow.length-1] = new Block({nextX: mergedRow.length-1}, mergedRow[mergedRow.length-1]);
      }
    });

    // 填充 0
    for(var c=0; c<me.size; c++){
      if(!mergedRow[c]){
        mergedRow[c] = new Block({
          x: c,
          y: rowIndex,
          nextX: c,
          nextY: rowIndex
        });
      }

      if(mergedRow[c].value !== row[c].value){
        hasChanged = true;
      }
    }

    newBlocks[rowIndex] = [...mergedRow];
  });

  // 转回来
  for(i=0; i<4-dir; i++){
    newBlocks = rotateLeft(newBlocks);
    oldBlocks = rotateLeft(oldBlocks);
  }

  Object.assign(me, {
    blocks: oldBlocks,
    nextBlocks: newBlocks
  });

  // 前后有区别才添加新的方块
  if(hasChanged){
    me.moving = true;
    if(addedScore > 0){
      me.score += addedScore;
      me.addedScoreRecord.push(addedScore);
    }
    me.addRandomBlock();
  }

  return me;
}

/**
 * 把 方形 矩阵向左旋转
 * @param  {[type]} matrix [矩阵]
 * @return {[type]}        [向左旋转一次后的矩阵]
 */
var rotateLeft = (matrix) => {
  var newMatrix = [];
  var size = matrix.length;

  [...matrix].map((row, rowIndex) => {
    row.map((block, colIndex) => {
      var newRowIndex = size - 1 - colIndex;
      if(!newMatrix[newRowIndex]){
        newMatrix[newRowIndex] = [];
      }
      // 更新 (x, y, nextX, nextY)
      newMatrix[newRowIndex][rowIndex] = new Block({
        x: rowIndex,
        y: newRowIndex,
        nextX: block.nextY,
        nextY: size - 1 - block.nextX,
        randomNew: false
      }, block); 
    });
  });

  return newMatrix;
}

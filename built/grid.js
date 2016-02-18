/**
 * modal
 */

// 之后可以把数字替换成对象，每个瓷块都有自己的特征

var Grid = function(options){
  this.size = options.size;

  this.initBlocks();
}

/**
 * 初始化生成 blocks
 * @return {[type]} [description]
 */
Grid.prototype.initBlocks = function(){
  this.blocks = [];
  this.canMove = true;

  for(var r=0; r<this.size; r++){
    this.blocks[r] = [];
    for(var c=0; c<this.size; c++){
      this.blocks[r][c] = 0;
    }
  }
  this.addRandomBlock();

  return this;
}

/**
 * 空白处随机生成数字方块
 * @return {[type]} [description]
 */
Grid.prototype.addRandomBlock = function(){
  var emptyBlocks = [];

  this.blocks.map(function(row, rowIndex){
    row.map(function(block, colIndex){
      if(block===0){
        emptyBlocks.push({
          r: rowIndex,
          c: colIndex
        });
      }
    });
  });

  var randomBlock = emptyBlocks[Math.floor( Math.random() * emptyBlocks.length )];
  this.blocks[randomBlock.r][randomBlock.c] = Math.random() < 0.5 ? 2 : 4;

  // 判断是否 game over，没有空格 && 相邻的都不同 -> over
  this.checkMove();
}

/**
 * 检查是否还能移动
 * @return {[type]} [description]
 */
Grid.prototype.checkMove = function(){
  var me = this;

  // 有空格 || 等于右边方块 || 等于下面方块
  this.canMove = me.blocks.some(function(row, rowIndex){
    return row.some(function(block, colIndex){
      return (
        block === 0 ||
        block === me.blocks[rowIndex][colIndex+1] || 
        block === (me.blocks[rowIndex+1]&&me.blocks[rowIndex+1][colIndex])
      );
    });
  });

  return this;
}

/**
 * 移动
 * @return {[type]} dir [方向，0 -> left, 1 -> up, 2 -> right, 3 -> down]
 */
Grid.prototype.move = function( dir ){
  var me = this;
  var newBlocks = [];
  var hasChanged = false;
  var i;

  // 旋转矩阵
  for(i=0; i<dir; i++){
    this.blocks = rotateLeft(this.blocks);
  }

  // 去掉 0, 合并相邻相等的方块
  me.blocks.map(function(row, rowIndex){
    newBlocks[rowIndex] = [];
    var mergedRow = newBlocks[rowIndex];
    var hasMerged = [];

    // 一行的逻辑
    row.map(function(block){
      if(block!==0){
        // 前一块没有合并过 && 前一块跟这块相同，就合并
        var preBlock = mergedRow[mergedRow.length-1];
        if(preBlock && !hasMerged[mergedRow.length-1] && preBlock === block){
          mergedRow[mergedRow.length-1] *=2;
          hasMerged[mergedRow.length-1] = true;
        }else{
          mergedRow.push(block);
          hasMerged[mergedRow.length] = false;
        }
      }
    });

    // 填充 0
    for(var c=0; c<me.size; c++){
      if(!mergedRow[c]){
        mergedRow[c] = 0;
      }

      if(mergedRow[c] !== row[c]){
        hasChanged = true;
      }
    }
  });

  me.blocks = newBlocks;

  // 前后有区别才添加新的方块
  if(hasChanged){
    me.addRandomBlock();
  }

  // 转回来
  for(i=0; i<4-dir; i++){
    this.blocks = rotateLeft(this.blocks);
  }

  return me;
}

/**
 * 把 方形 矩阵向左旋转
 * @param  {[type]} matrix [矩阵]
 * @return {[type]}        [向左旋转一次后的矩阵]
 */
var rotateLeft = function(matrix){
  var newMatrix = [];
  var size = matrix.length;

  matrix.map(function(row, rowIndex){
    row.map(function(data, colIndex){
      var newRowIndex = size - 1 - colIndex;
      if(!newMatrix[newRowIndex]){
        newMatrix[newRowIndex] = [];
      }
      newMatrix[newRowIndex][rowIndex] = data;
    });
  });

  return newMatrix;
}

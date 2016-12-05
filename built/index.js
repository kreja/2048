/**
 * view
 */

const size = 4;
const moveTime = 310; // ms

var GridView = React.createClass({displayName: "GridView",
	getInitialState: function(){
		return {
			grid: new Grid({size: size})
		};
	},
	componentDidMount: function () {
	  window.addEventListener('keydown', this.handleKeyDown);
	},
	componentWillUnmount: function () {
	  window.removeEventListener('keydown', this.handleKeyDown);
	},
	handleKeyDown: function(e) {
		let { grid } = this.state;
		if(!grid.canMove){
			return;
		}
		if(event.keyCode >= 37 && event.keyCode <= 40){
			e.preventDefault();
			
			if(this.moveT){ // 避免多次操作
				return;
			}

			// 先结束上次移动
			clearTimeout(this.t);
			this.setState({
				grid: grid.endMoving()
			}, ()=>{
				// 中间需要短暂显示下上次移动后的结果，所以定时执行本次移动
				this.moveT = setTimeout(() => {
					this.moveT = undefined;
					
					this.setState({
						grid: this.state.grid.move(e.keyCode - 37)
					}, ()=>{
						this.t = setTimeout(() => {
							this.setState({
								grid: this.state.grid.endMoving()
							});
						}, moveTime);
					});
				}, 10);
			});
		}
	},
	/**
	 * 重新开始
	 * @return {[type]} [description]
	 */
	onRestart: function(){
		this.setState({
			grid: this.state.grid.initBlocks()
		});
	},
	render: function(){
		let { grid } = this.state;
		const { addedScoreRecord } = grid;

		return (
			React.createElement("div", {className: "app"}, 
				React.createElement("div", {className: "hd"}, 
					React.createElement("h1", {className: "title-2048"}, "2048"), 
					React.createElement("div", {className: "score-container"}, 
						React.createElement("div", {className: "score"}, 
							React.createElement("div", {className: "title"}, "SCORE"), 
							React.createElement("div", {className: "subtitle"},  grid.score)
						), 
						React.createElement("div", {className: "score"}, 
							React.createElement("div", {className: "title"}, "BEST"), 
							React.createElement("div", {className: "subtitle"},  grid.highestScore)
						)
					), 
					
						addedScoreRecord.map((score, index) => {
							if(index == addedScoreRecord.length - 1){
								return React.createElement("div", {key: index, className: "added-score iconfont icon-love"}, "+ ",  score  )
							}
						})
					
				), 
				React.createElement("div", {className: "grid-container"}, 
					React.createElement("div", {className:  "grid " + (grid.moving ? 'moving' : '')}, 
						React.createElement(Bg, null), 
						 
							grid.blocks.map((row,rowIndex) =>
								row.map((block, colIndex) => {
									return block.value ? 
										React.createElement(ABlock, {key: colIndex, block: block, moving: grid.moving}) : 
										null;
								})
							)
						
					), 
					 (grid.moving || grid.canMove) ? null : React.createElement(GameOverLay, {onRestart: this.onRestart})
				), 
				React.createElement("div", {className: "btn-restart", onClick:  this.onRestart}, "NEW GAME")
			)
		);
	}
});

var Bg = React.createClass({displayName: "Bg",
	render: function(){
		return React.createElement("div", null, 
			
				(new Array(size * size).fill(undefined)).map((i, index) => 
					React.createElement("span", {key:  index, className: "block"})
				)
			
		);
	}
});

var ABlock = React.createClass({displayName: "ABlock",
	render: function(){
		const { block, moving } = this.props;
		// moving 时，pos-x-y 变成 pos-nextX-nextY
		var blockClass = 'block' 
				+ ( ' num-' + (block.value ? Math.log2(block.value) : 0) ) 
				+ ` pos-${moving ? block.nextX : block.x}-${moving ? block.nextY : block.y}`
				+ (block.randomNew ? ' new' : '');

		return (
			React.createElement("span", {className: blockClass}, block.value ? block.value : null)
		);
	}
});

var GameOverLay = React.createClass({displayName: "GameOverLay",
	render: function(){
		return (
			React.createElement("div", {className: "overlay aligner"}, 
				React.createElement("div", {className: "overlay-content aligner-center"}, 
					React.createElement("p", {className: "text"}, "Game Over!"), 
					React.createElement("button", {className: "try-again-btn", onClick: this.props.onRestart}, "Try Again")
				)
			)
		);
	}
});

ReactDOM.render(
  React.createElement(GridView, null),
  document.getElementById('grid')
);


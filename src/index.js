/**
 * view
 */

const size = 4;
const moveTime = 310; // ms

var GridView = React.createClass({
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
			<div className="app">
				<div className="hd">
					<h1 className="title-2048">2048</h1>
					<div className="score-container">
						<div className="score">
							<div className="title">SCORE</div>
							<div className="subtitle">{ grid.score }</div>
						</div>
						<div className="score">
							<div className="title">BEST</div>
							<div className="subtitle">{ grid.highestScore }</div>
						</div>
					</div>
					{
						addedScoreRecord.map((score, index) => {
							if(index == addedScoreRecord.length - 1){
								return <div key={index} className="added-score iconfont icon-love">+ { score  }</div>
							}
						})
					}
				</div>
				<div className="grid-container">
					<div className={ "grid " + (grid.moving ? 'moving' : '')}>
						<Bg />
						{ 
							grid.blocks.map((row,rowIndex) =>
								row.map((block, colIndex) => {
									return block.value ? 
										<ABlock key={colIndex} block={block} moving={grid.moving}></ABlock> : 
										null;
								})
							)
						}
					</div>
					{ (grid.moving || grid.canMove) ? null : <GameOverLay onRestart={this.onRestart}></GameOverLay> }
				</div>
				<div className="btn-restart" onClick={ this.onRestart }>NEW GAME</div>
			</div>
		);
	}
});

var Bg = React.createClass({
	render: function(){
		return <div>
			{
				(new Array(size * size).fill(undefined)).map((i, index) => 
					<span key={ index } className="block"></span>
				)
			}
		</div>;
	}
});

var ABlock = React.createClass({
	render: function(){
		const { block, moving } = this.props;
		// moving 时，pos-x-y 变成 pos-nextX-nextY
		var blockClass = 'block' 
				+ ( ' num-' + (block.value ? Math.log2(block.value) : 0) ) 
				+ ` pos-${moving ? block.nextX : block.x}-${moving ? block.nextY : block.y}`
				+ (block.randomNew ? ' new' : '');

		return (
			<span className={blockClass}>{block.value ? block.value : null}</span>
		);
	}
});

var GameOverLay = React.createClass({
	render: function(){
		return (
			<div className="overlay aligner">
				<div className="overlay-content aligner-center">
					<p className="text">Game Over!</p>
					<button className="try-again-btn" onClick={this.props.onRestart}>Try Again</button>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
  <GridView />,
  document.getElementById('grid')
);


/**
 * view
 */

var GridView = React.createClass({
	getInitialState: function(){
		return {
			grid: new Grid({size: 4})
		};
	},
	componentDidMount: function () {
	  window.addEventListener('keydown', this.handleKeyDown);
	},
	componentWillUnmount: function () {
	  window.removeEventListener('keydown', this.handleKeyDown);
	},
	handleKeyDown: function(e){
		if(!this.state.grid.canMove){
			return;
		}
		if(event.keyCode >= 37 && event.keyCode <= 40){
			e.preventDefault();
			this.setState({
				grid: this.state.grid.move(e.keyCode - 37)
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
		var grid = this.state.grid;

		return (
			<div className="app">
				<div className="grid">
					{
						grid.blocks.map(function(row,rowIndex){
							return (
								<div key={rowIndex}>
									{
										row.map(function(block, colIndex){
											return (
												<Block key={colIndex} block={block}></Block>
											)
										})
									}
								</div>
							);
						})
					}
				</div>
				{
					grid.canMove ? null : <GameOverLay onRestart={this.onRestart}></GameOverLay>
				}
			</div>
		);
	}
});

var Block = React.createClass({
	render: function(){
		var block = this.props.block;
		var blockClass = 'block';
		blockClass += ( ' num-' + (block ? Math.log2(block) : 0) );

		return (
			<span className={blockClass}>{block ? block : null}</span>
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


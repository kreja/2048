/**
 * view
 */

var GridView = React.createClass({displayName: "GridView",
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
			React.createElement("div", {className: "app"}, 
				React.createElement("div", {className: "grid"}, 
					
						grid.blocks.map(function(row,rowIndex){
							return (
								React.createElement("div", {key: rowIndex}, 
									
										row.map(function(block, colIndex){
											return (
												React.createElement(Block, {key: colIndex, block: block})
											)
										})
									
								)
							);
						})
					
				), 
				
					grid.canMove ? null : React.createElement(GameOverLay, {onRestart: this.onRestart})
				
			)
		);
	}
});

var Block = React.createClass({displayName: "Block",
	render: function(){
		var block = this.props.block;
		var blockClass = 'block';
		blockClass += ( ' num-' + (block ? Math.log2(block) : 0) );

		return (
			React.createElement("span", {className: blockClass}, block ? block : null)
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


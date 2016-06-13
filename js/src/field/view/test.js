"use strict";

// tutorial1.js
var CommentBox = React.createClass({
  displayName: "CommentBox",

  render: function render() {
    return React.createElement(
      "div",
      { className: "commentBox" },
      "Hello, world! I am a CommentBox."
    );
  }
});
ReactDOM.render(React.createElement(CommentBox, null), document.getElementById('content'));

var output = document.getElementById('output');

var Logger = {

    clear: function() {
        output.textContent = '';
    },

    setText: function(text) {
        output.textContent = text;
    }
};

export {Logger};

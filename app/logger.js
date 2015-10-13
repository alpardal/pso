let output = document.getElementById('output');

let Logger = {

    clear: function() {
        output.textContent = '';
    },

    setText: function(text) {
        output.textContent = text;
    }
};

export {Logger};

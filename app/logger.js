let output = document.getElementById('output');

let Logger = {

    clear() {
        output.textContent = '';
    },

    setText(text) {
        output.textContent = text;
    }
};

export {Logger};

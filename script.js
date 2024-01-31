const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const body = document.querySelector('body'),
text = document.getElementById('text'),
status = document.getElementById('status'),
heading = document.getElementById('heading'),
info = document.querySelector('#info-text'),
default_info = info.innerHTML,
double_click_time = 500;
let last_click = 0,
recording = false,
sro, input, output, error;

function tts(called_time) {
    setTimeout(function() {
        if (last_click == called_time) {
            heading.innerHTML = 'Text to Speech';
            status.innerHTML = 'Mengambil input...';
            let utterance = new SpeechSynthesisUtterance();
            utterance.lang = 'id';
            navigator.clipboard.readText()
            .then(clipboard_text => {
                input = clipboard_text;
                console.log('succesfully got input');
                text.innerText = input;
                text.classList.remove('empty');
                utterance.text = input;
                status.innerHTML = 'Membacakan input...'
                console.log(`attempting to read out ${utterance.text}`)
                speechSynthesis.speak(utterance);
            }).catch(exception => {
                input = undefined;
                error = exception;
                console.log(exception);
                text.innerText = input;
                text.classList.remove('empty');
                utterance.text = input;
                utterance.text = 'error, mohon klik sekali lagi';
                speechSynthesis.speak(utterance);
                status.innerHTML = 'Error mendapatkan input';
                text.innerText = error;
                text.classList.add('empty');
            });
            utterance.onend = function() {
                console.log(input !== undefined);
                if (input !== undefined) {
                    status.innerHTML = 'Teks di clipboard:';
                } else {
                    status.innerHTML = 'Error mendapatkan input';
                };
                console.log('executed tts');
            };
        };
    }, double_click_time)
};

function stt() {
    heading.innerHTML = 'Speech to Text';
    status.innerHTML = 'Merekam input...';
    sro = new SpeechRecognition();
    sro.lang = 'id';
    let utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'id';
    sro.onresult = event => {
        output = event.results[0][0].transcript;
        navigator.clipboard.writeText(output)
        .then(result => {console.log(`successfully wrote text to clipboard, ${result}`)})
        .catch(error => {console.log(`error writing text to clipboard, ${error}`)});
        console.log(output);
        status.innerHTML = 'Input yang terekam:';
        text.innerText = output;
        text.classList.remove('empty');
        utterance.text = output;
        speechSynthesis.speak(utterance);
        utterance.onend = function() {
            console.log('executed stt')
        };
    };
    sro.onend = event => {
        utterance.text = 'Error merekam input';
        utterance.onend = function() {
            console.log('executed stt')
        };
    }
    sro.start();
};

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        speechSynthesis.cancel();
        sro.stop()
    };
});

body.onclick = function() {
    speechSynthesis.cancel();
    current_click = new Date().getTime();
    console.log(`body clicked, current_click = ${current_click}`);
    text.classList.add('empty');

    if (recording) {
        sro.stop();
    } else {
        if (current_click - last_click < double_click_time) {
            console.log(`executing stt on ${current_click}`);
            last_click = 0;
            stt(current_click);
        } else {
            console.log(`executing stt on ${current_click}`);
            tts(current_click);
        };
    };

    last_click = current_click;
};

navigator.permissions.query({name: 'clipboard-write'})
.then(result => {
    console.log(`clipboard-write permission state is ${result.state}`);
});
navigator.permissions.query({name: 'clipboard-read'})
.then(result => {
    console.log(`clipboard-read permission state is ${result.state}`);
});
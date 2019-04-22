const form = document.forms.enroll;
const range = form.elements['grade'];
const clearButtons = form.querySelectorAll('input[type=button]');
const textFields = form.querySelectorAll('.clear > input:nth-of-type(1), textarea');
const nonTextFields = form.querySelectorAll('input[type=date], select');
const checkboxes = form.elements['courses'];
const radio = form.elements['gender'];
window.onload = displaySavedState;

//event listeners

range.addEventListener('input', (e) => {
    const output = form.elements['mark'];
    output.className = '';
    output.value = e.target.value;
    changeState(e.target.name, e.target.value);
});

form.addEventListener('submit', (e) => {
    if(isFormValid()) {
        //submitForm();
    }
    e.preventDefault();
});

textFields.forEach(text => {
    text.addEventListener('input', activateText);
    text.addEventListener('blur', validateText);
    text.addEventListener('focus', (e) => {
        e.target.className = '';
    })
});

nonTextFields.forEach(el => {
    el.addEventListener('input', (e) => {
        changeState(e.target.name, e.target.value);
    })
    el.addEventListener('focus', (e) => {
        e.target.className = '';
    });
})

radio.forEach(el => {
    el.addEventListener('focus', (event) => {
        changeState(event.target.name, event.target.value);
        radio.forEach(elem => {
            elem.nextElementSibling.className = '';
        });
    })
})

clearButtons.forEach(button => {
    button.addEventListener('click', clearText);
});

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('input', validateCheckboxes);
    checkbox.addEventListener('input', changeLocalStorageCourses);
});

//functions

function activateText(e) {
    if(e.target.value !== '') {
        e.target.nextElementSibling.nextElementSibling.style.display = 'inline';
    } else {
        e.target.nextElementSibling.nextElementSibling.style.display = 'none';
    };
}

function clearText(e) {
    e.target.previousElementSibling.previousElementSibling.value = '';
    e.target.style.display = 'none';
}

function validateText(e) {
    if(!e.target.validity.valid) {
        e.target.className = 'invalid';
        e.target.nextElementSibling.style.display = 'inline';
    } else {
        e.target.nextElementSibling.style.display = 'none';
        changeState(e.target.name, e.target.value);
        e.target.className = '';
    }
}

function validateCheckboxes(e) {
    let checkedBoxNum = form.querySelectorAll('input[type=checkbox]:checked').length;
    if(checkedBoxNum < 1) {
        checkboxes.forEach(el => {
            el.nextElementSibling.className = 'invalid';
        });
    } else {
        checkboxes.forEach(el => {
            el.nextElementSibling.className = '';
        });
    }
}

function changeLocalStorageCourses(e) {
    let state = getState();
    if(state && state.courses) {
        if(e.target.checked) {
            state.courses.push(e.target.value);
        } else {
            const index = state.courses.findIndex(el => el === e.target.value);
            state.courses.splice(index, 1);
        }
        changeState('courses', state.courses);
    } else {
        changeState('courses', [e.target.value]);
    }
}

function getState() {
    try{
        const state = localStorage.getItem('state');
        if(state) {
            return JSON.parse(state);
        }
        return null;
    } catch(err) {
        console.log(err);
        return null;
    }
}

function saveState(data) {
    try{
        const state = JSON.stringify(data);
        localStorage.setItem('state', JSON.stringify(data));
    } catch(err) {
        console.log(err);
    }
}

function changeState(key, value) {
    const state = getState();
    if(state) {
        state[key] = value;
        saveState(state);
    } else {
        saveState({[key]: value});
    }
}

function displaySavedState() {
    const state = getState();
    if(state) {
        const elements = form.elements;
        const keys = Object.keys(state);
        keys.forEach(key => {
            elements[key].value = state[key] ? state[key] : '';
        });
        if(state.courses) {
            state.courses.forEach(item => {
                elements.courses[item].checked = true;
            })
        }
    }
}

function isFormValid() {
    const output = form.elements['mark'];
    const textFields = form.querySelectorAll('.clear > input:nth-of-type(1), textarea');
    const nonTextFields = form.querySelectorAll('input[type=date], select');
    const checkboxes = form.elements['courses'];
    const radio = form.elements['gender'];
    let invalidFieldsNum = 0;
    textFields.forEach(el => {
        if(!el.validity.valid) {
            el.className = 'invalid';
            el.nextElementSibling.style.display = 'inline';
            invalidFieldsNum++;
        }
    });
    nonTextFields.forEach(el => {
        if(!el.validity.valid) {
            el.className = 'invalid';
            invalidFieldsNum++;
        }
    });
    radio.forEach(el => {
        if(!el.validity.valid) {
            el.nextElementSibling.className = 'invalid';
            invalidFieldsNum++;
        }
    });
    if(output.value === '') {
        output.className = 'invalid';
        invalidFieldsNum++;
    }
    if(form.querySelectorAll('input[type=checkbox]:checked').length < 1) {
        invalidFieldsNum++;
        checkboxes.forEach(el => {
            el.nextElementSibling.className = 'invalid';
        })
    }
    if(invalidFieldsNum !== 0) {
        form.querySelector('.error-header').style.display = 'inline';
        return false;
    }
    return true;
}

async function submitForm() {
    const url = 'https://jsonplaceholder.typicode.com/users';
    const state = getState();
    try {
        const loadingMessage = document.createElement('p');
        loadingMessage.innerHTML = 'Wait a second...';
        loadingMessage.className = 'loading-message';
        document.body.appendChild(loadingMessage);
        const response = await new Promise(resolve =>
            setTimeout(resolve, 1500)
        ).then(() =>
            fetch(url, {
                method: "POST",
                body: JSON.stringify(state),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            })
        );

        const user = await response.json();
        const p = document.createElement('p');
        if (response.status === 201) {
            p.innerText = 'Thanks, we received it!';
            localStorage.removeItem('state');
            p.className = 'message';
            loadingMessage.remove();
            form.remove();
            document.body.appendChild(p);
        } else {
            p.innerText = 'Oops, something went wrong.\n Restore page and try again';
            p.className = 'error';
            loadingMessage.remove();
            form.remove();
            document.body.appendChild(p);
        }
    } catch(err) {
        console.log(err);
    }
}


const form = document.forms.enroll;
const range = form.elements.grade;
const output = form.elements.mark;
const clearButtons = form.querySelectorAll('input[type=button]');
const resetBtn = form.querySelector('input[type=reset]');
const textFields = form.querySelectorAll('.text');
const nonTextFields = form.querySelectorAll('input[type=date], select');
const checkboxes = form.elements['courses'];
const radio = form.elements['gender'];
window.onload = displaySavedState;

//date range

(function setDateRange() {
    const date = form.querySelector('input[type=date]');
    const maxAge = 30;
    const minAge = 15;
    const today = new Date();
    const minYear = today.getFullYear() - maxAge;
    const maxYear = today.getFullYear() - minAge;
    const thisMonth = today.getMonth() < 10 ? '0' + (today.getMonth() + 1) : today.getMonth();
    const thisDate = today.getDate() < 10 ? '0' + today.getDate() : today.getDate() + 1;
    date.setAttribute('min', `${minYear}-${thisMonth}-${thisDate}`);
    date.setAttribute('max', `${maxYear}-${thisMonth}-${thisDate}`);
})();

//event listeners

range.addEventListener('input', displayMark);

form.addEventListener('submit', onSubmitClick);

resetBtn.addEventListener('click', resetForm)

textFields.forEach(text => {
    text.addEventListener('input', activateText);
    text.addEventListener('blur', validateText);
    text.addEventListener('focus', removeClass)
});

nonTextFields.forEach(el => {
    el.addEventListener('input', onNonTextInput);
    el.addEventListener('focus', removeClass);
})

radio.forEach(el => {
    el.addEventListener('focus', onRadioFocus);
})

clearButtons.forEach(button => {
    button.addEventListener('click', clearText);
});

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('input', validateCheckboxes);
    checkbox.addEventListener('input', changeLocalStorageCourses);
});

//functions

function displayMark(e) {
    output.className = '';
    output.value = e.target.value;
    changeState(output.name, e.target.value);
}

function resetForm() {
    localStorage.removeItem('state');
}

function onSubmitClick(e) {
    if(isFormValid()) {
        submitForm();
    }
    e.preventDefault();
}

function onNonTextInput(e) {
    changeState(e.target.name, e.target.value);
}

function removeClass(e) {
    e.target.className = '';
}

function onRadioFocus(e) {
    changeState(event.target.name, event.target.value);
    radio.forEach(elem => {
        elem.nextElementSibling.className = '';
    });
}

function activateText(e) {
    if(e.target.value) {
        e.target.nextElementSibling.nextElementSibling.style.display = 'inline';
    } else {
        e.target.nextElementSibling.nextElementSibling.style.display = 'none';
    };
}

function clearText(e) {
    e.target.previousElementSibling.previousElementSibling.value = '';
    changeState(e.target.previousElementSibling.previousElementSibling.name);
    e.target.style.display = 'none';
}

function validateText(e) {
    if(!e.target.validity.valid) {
        e.target.className = 'invalid';
        e.target.nextElementSibling.style.visibility = 'visible';
    } else {
        e.target.nextElementSibling.style.visibility = 'hidden';
        changeState(e.target.name, e.target.value);
        e.target.className = '';
    }
}

function validateCheckboxes(e) {
    let checkedBoxNum = form.querySelectorAll('input[type=checkbox]:checked').length;
    if(!checkedBoxNum) {
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
            elements[key].value = state[key];
            if(elements[key].className === 'text') {
                elements[key].nextElementSibling.nextElementSibling.style.display = 'inline';
            }
        });
        if(state.courses) {
            state.courses.forEach(item => {
                elements.courses[item].checked = true;
            })
        }
    }
}

function isFormValid() {
    const output = form.elements.grade;
    const textFields = form.querySelectorAll('.clear > input:nth-of-type(1), textarea');
    const nonTextFields = form.querySelectorAll('input[type=date], select');
    const checkboxes = form.elements['courses'];
    const radio = form.elements['gender'];
    let invalidFieldsNum = 0;
    textFields.forEach(el => {
        if(!el.validity.valid) {
            el.className = 'invalid';
            el.nextElementSibling.style.visibility = 'visible';
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
    if(!output.value) {
        output.className = 'invalid';
        invalidFieldsNum++;
    }
    if(!form.querySelectorAll('input[type=checkbox]:checked').length) {
        invalidFieldsNum++;
        checkboxes.forEach(el => {
            el.nextElementSibling.className = 'invalid';
        })
    }
    if(invalidFieldsNum) {
        form.querySelector('.error-header').style.visibility = 'visible';
        return false;
    }
    form.querySelector('.error-header').style.visibility = 'hidden';
    return true;
}

async function submitForm() {
    const url = 'https://reqres.in/api/register';
    const state = getState();
    const loadingMessage = displayMessage('loading');
    try {
        const response = await new Promise(resolve =>
            setTimeout(resolve, 1500)
        )
        .then(() =>
            fetch(url, {
                method: "POST",
                body: JSON.stringify(state),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            })
        );
        loadingMessage.remove();
        form.remove();
        removeListeners();
        if(response.status >= 200 && response.status <= 300) {
            const user = await response.json();
            displayMessage('info', user);
            localStorage.removeItem('state');
        } else {
            displayMessage('error');
        }
    } catch(err) {
        console.log(err);
    }
}

function displayMessage(type, user) {
    let message = document.createElement('p');
    switch(type) {
        case 'loading':
            message.innerText = 'Wait a second...';
            break;
        case 'info':
            message.innerText = `Thanks, we received it!\n Your student id is ${user.id}.`;
            break;
        case 'error':
            message.innerText = 'Oops, something went wrong.\n Restore page and try again';
            break;
    }
    message.className = type;
    document.body.appendChild(message);
    return message;
}

function removeListeners() {
    range.removeEventListener('input', displayMark);

    form.removeEventListener('submit', submitForm);
    
    resetBtn.removeEventListener('click', resetForm)
    
    textFields.forEach(text => {
        text.removeEventListener('input', activateText);
        text.removeEventListener('blur', validateText);
        text.removeEventListener('focus', removeClass)
    });
    
    nonTextFields.forEach(el => {
        el.removeEventListener('input', onNonTextInput);
        el.removeEventListener('focus', removeClass);
    })
    
    radio.forEach(el => {
        el.removeEventListener('focus', onRadioFocus);
    })
    
    clearButtons.forEach(button => {
        button.removeEventListener('click', clearText);
    });
    
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('input', validateCheckboxes);
        checkbox.removeEventListener('input', changeLocalStorageCourses);
    });
}
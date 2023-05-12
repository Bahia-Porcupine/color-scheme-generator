'use strict';

const dom = {
    create({
        content = '',
        type = 'div',
        parent = false,
        classes = [],
        attr = {},
        listeners = {},
        styles = {},
        amEnde = true,
    } = {}) {
        let newDomEl = document.createElement(type);
        if (content) newDomEl.innerHTML = content;
        if (classes.length) newDomEl.className = classes.join(' ');
    
        Object.entries(attr).forEach(el => newDomEl.setAttribute(...el));
        Object.entries(listeners).forEach(el => newDomEl.addEventListener(...el));
        Object.entries(styles).forEach(style => newDomEl.style[style[0]] = style[1]);
    
        if (parent) {
            if (!amEnde) parent.prepend(newDomEl);
            else parent.append(newDomEl);
        }
    
        return newDomEl;
    },
    $(selector) {
        return document.querySelector(selector);
    },
    $$(selector) {
        return [...document.querySelectorAll(selector)];
    },
}

export default dom;